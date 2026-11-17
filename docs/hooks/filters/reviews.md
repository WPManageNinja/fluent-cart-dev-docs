---
title: Review Filter Hooks
description: Filter hooks for FluentCart product reviews — moderation, payloads, reviewer privacy, rating thresholds, storefront rendering and photo limits.
---

# Reviews

Filters for the product reviews feature. They fall into a few groups:

- **Moderation and submission** — what a submission is allowed to do, and the status it is stored with.
- **Response payloads** — what the storefront, the customer dashboard and the admin screen get back.
- **Reviewer privacy** — how much of a reviewer's identity public surfaces show.
- **Rating thresholds** — when a product's rating is shown at all.
- **Rendering** — the markup, controls and script data of the reviews section.
- **Photo limits** <Badge type="warning" text="Pro" /> — the caps on photo reviews.

Two conventions run through the whole set. Several filters are **one-directional**:
a listener may tighten what the store decided but never loosen it. And several
results are **clamped or validated afterwards**, so a filter cannot return a value
that would break the surface it feeds. Each entry below says which applies.

---

## Moderation and submission

### <code> review/can_submit </code>
<details open>
<summary><code>fluent_cart/review/can_submit</code> &mdash; Decide whether a visitor may leave a review</summary>

**When it runs:**
Runs on the storefront submission endpoint after FluentCart's own gates — reviews
enabled for the product, the store's permission mode (anyone, logged in, verified
buyers), the duplicate check and the order grant. It runs **twice** per
submission: once early, and once more under the slot lock just before the insert,
so that two concurrent submissions for the same slot cannot both pass.

Because it runs under the lock too, a listener must be cheap and must not depend
on anything it changed on the first pass.

**Parameters:**
- `$canSubmit` (array): The decision so far
    ```php
    $canSubmit = [
        'can_submit' => true,   // bool
        'message'    => '...',  // Shown to the visitor when can_submit is false
    ];
    ```
- `$postId` (int): The product being reviewed.
- `$request`: The submission request. The variation, when there is one, is on the request as `item_id`.

**Returns:** An array with a `can_submit` key. Anything else — a bare boolean, a
string, `null` — is treated as a refusal, so always return the array. When you
refuse, set `message` as well: the first pass answers `403` and the second `409`,
each using your wording.

**Source:** `app/Http/Controllers/FrontendControllers/ProductReviewFrontendController.php:386`

Runs again at `app/Http/Controllers/FrontendControllers/ProductReviewFrontendController.php:556`, under the slot lock.

**Usage:**
```php
add_filter('fluent_cart/review/can_submit', function ($canSubmit, $postId, $request) {
    // Already refused — leave the existing reason alone
    if (empty($canSubmit['can_submit'])) {
        return $canSubmit;
    }

    // Only accept reviews from accounts older than a week
    $user = wp_get_current_user();

    if ($user->ID && strtotime($user->user_registered) > strtotime('-7 days')) {
        return [
            'can_submit' => false,
            'message'    => __('New accounts can leave a review after seven days.', 'my-addon'),
        ];
    }

    return $canSubmit;
}, 10, 3);
```
</details>

### <code> review/submission_status </code>
<details>
<summary><code>fluent_cart/review/submission_status</code> &mdash; Hold a new review back for moderation</summary>

**When it runs:**
Runs on the storefront submission path, before
[`review/submit_data`](#review-submit-data) — which is deliberate, because that
filter captures the status as a trust field and re-imposes it afterwards. This is
the one place a listener can influence the status a submission is stored with.

Moderation is the store's decision, but an add-on owns facts that decision
depends on: Pro knows a submission carries photos, and the store's "auto approve
photo reviews" switch cannot be honoured without that.

**Parameters:**
- `$status` (string): What the store's own rule decided — `approved` or `pending`.
- `$reviewData` (array): The review payload as assembled so far.
- `$request`: The submission request.

**Returns:** A status string. **One direction only:** `approved` may be turned
into `pending`, and nothing else is honoured. A status this install does not have
is ignored; a review already held back cannot be released; and `spam` or `trash`
are a moderator's judgement, not a submission's starting point. So the most a
listener can do is ask for more moderation.

**Source:** `app/Services/ProductReviewService.php:1263`

**Usage:**
```php
add_filter('fluent_cart/review/submission_status', function ($status, $reviewData, $request) {
    // Queue anything with a link in it for a human to read
    $content = (string) \FluentCart\Framework\Support\Arr::get($reviewData, 'review', '');

    if (preg_match('#https?://#i', $content)) {
        return 'pending';
    }

    return $status;
}, 10, 3);
```
</details>

### <code> review/submit_data </code>
<details>
<summary><code>fluent_cart/review/submit_data</code> &mdash; Shape the payload a new review is written from</summary>

**When it runs:**
Runs on both create paths — a storefront submission and a moderator's Add Review —
just before the insert. The ordering is the point: the filter sees the full
payload so a listener can add its own keys, but the fields the server decided are
merged back on top afterwards from values captured before it ran.

A `meta` key on this payload is how the photo pipeline carries pending attachment
ids and claim tokens from the request to the row.

**Parameters:**
- `$reviewData` (array): The create payload — `post_id`, `item_id`, `reviewer_name`, `reviewer_email`, `title`, `review`, `rating`, `status`, `is_verified` and so on.
- `$request`: The request the review came from.
- `$postId` (int): The product being reviewed.

**Returns:** The payload array. These keys are **re-imposed after the filter** and
cannot be changed by it: `post_id`, `item_id`, `status`, `is_verified`,
`is_admin_reply`, `user_id`, `customer_id`, `order_id`. To influence the status,
use [`review/submission_status`](#review-submission-status).

**Source:** `app/Services/ProductReviewService.php:1310`

**Usage:**
```php
add_filter('fluent_cart/review/submit_data', function ($reviewData, $request, $postId) {
    // Normalise a shouting title before it is stored
    $title = (string) \FluentCart\Framework\Support\Arr::get($reviewData, 'title', '');

    if ($title !== '' && $title === strtoupper($title)) {
        $reviewData['title'] = ucfirst(strtolower($title));
    }

    return $reviewData;
}, 10, 3);
```
</details>

### <code> review/update_data </code>
<details>
<summary><code>fluent_cart/review/update_data</code> &mdash; Shape a customer's edit before it is saved</summary>

**When it runs:**
Runs on the storefront edit endpoint, after FluentCart has worked out which
fields the request actually changed and refused an empty edit.

**Parameters:**
- `$updateData` (array): The fields being written.
- `$request`: The edit request.
- `$postId` (int): The product.
- `$reviewId` (int): The review being edited.

**Returns:** The update array. It is **whitelisted afterwards to `content`,
`rating` and `title`** — every other key is dropped, so a filter cannot change
ownership, moderation state or the product the review belongs to. The status is
decided after the whitelist, by the store's auto-approve setting and
[`review/update_status`](#review-update-status).

**Source:** `app/Http/Controllers/FrontendControllers/ProductReviewFrontendController.php:744`

**Usage:**
```php
add_filter('fluent_cart/review/update_data', function ($updateData, $request, $postId, $reviewId) {
    // Keep edited content within the same limit the form enforces
    if (isset($updateData['content'])) {
        $updateData['content'] = mb_substr((string) $updateData['content'], 0, 2000);
    }

    return $updateData;
}, 10, 4);
```
</details>

### <code> review/update_status </code>
<details>
<summary><code>fluent_cart/review/update_status</code> &mdash; Hold an edited review back for moderation</summary>

**When it runs:**
Runs on the storefront edit path, and **only when the status being written is
`approved`** — there is nothing to decide otherwise. On a store that does not
auto-approve, an edit has already been sent back to `pending` before this runs,
so this filter is what an add-on uses to hold an edit on a store that does
auto-approve.

**Parameters:**
- `$status` (string): The status about to be written. Always `approved` when the filter runs.
- `$context` (array): What the edit consists of
    ```php
    $context = [
        'data'    => [...],   // The whitelisted update fields
        'request' => $request,
        'review'  => $review, // ProductReview — the row before the edit
    ];
    ```

**Returns:** A status string. **Only `pending` is honoured**; anything else keeps
`approved`. An extension can hold an approved edit, never publish a review the
store would have moderated.

**Source:** `app/Services/ProductReviewService.php:1228`

**Usage:**
```php
add_filter('fluent_cart/review/update_status', function ($status, $context) {
    $before = $context['review'];
    $after  = \FluentCart\Framework\Support\Arr::get($context, 'data.content', '');

    // A rewrite rather than a typo fix goes back through moderation
    if (similar_text((string) $before->content, (string) $after) < mb_strlen((string) $before->content) / 2) {
        return 'pending';
    }

    return $status;
}, 10, 2);
```
</details>

### <code> review_duplicate_statuses </code>
<details>
<summary><code>fluent_cart/review_duplicate_statuses</code> &mdash; Which existing reviews block a second one</summary>

**When it runs:**
Runs when FluentCart checks whether this buyer has already reviewed this slot. A
slot is a product and variation pair, so someone who ordered two variations may
review each once, and the product-level slot is its own.

The default deliberately leaves `spam` and `trash` out: a rejected review does not
block a fresh submission.

**Parameters:**
- `$statuses` (array): Default `['approved', 'pending']`.

**Returns:** A list of status strings. Widening it blocks more submissions;
narrowing it allows more. This set also governs the duplicate message the
storefront shows, so it stays consistent with the write-path guard.

**Source:** `app/Helpers/Status.php:388`

**Usage:**
```php
add_filter('fluent_cart/review_duplicate_statuses', function ($statuses) {
    // A review you marked as spam should still block a resubmission
    $statuses[] = 'spam';

    return $statuses;
}, 10, 1);
```
</details>

### <code> review/allow_multiple_replies </code>
<details>
<summary><code>fluent_cart/review/allow_multiple_replies</code> &mdash; Allow more than one store reply per review</summary>

**When it runs:**
Runs wherever FluentCart asks whether a review can carry more than one reply: the
admin reply form, the reply write path, and the storefront's threading flag.

FluentCart core ships exactly one store reply per review. The check short-circuits
to `false` before the filter runs unless FluentCart Pro is active, so this filter
takes effect on a Pro install.

**Parameters:**
- `$allowed` (bool): Default `false`.

**Returns:** A boolean, cast. `true` lifts the single-reply rule: the admin reply
form stays available after a reply exists, and the storefront allows threading for
logged-in visitors.

**Source:** `app/Services/ProductReviewService.php:111`

**Usage:**
```php
add_filter('fluent_cart/review/allow_multiple_replies', function ($allowed) {
    // Let the store keep answering on products you support publicly
    return true;
}, 10, 1);
```
</details>

### <code> review/allow_threaded_replies </code>
<details>
<summary><code>fluent_cart/review/allow_threaded_replies</code> &mdash; Turn on threaded review replies <Badge type="warning" text="Pro" /></summary>

**When it runs:**
Runs when Pro's reviews module asks whether threaded replies are on — multiple
store replies per review plus replies from the reviewer. Off by default.

Pro bridges this onto core's
[`review/allow_multiple_replies`](#review-allow-multiple-replies), so turning this
on lifts the single-reply rule too.

**Parameters:**
- `$enabled` (bool): Default `false`.

**Returns:** A boolean, cast. `true` enables the reply thread, which also makes
the reply endpoint and the thread modal's reply control available to logged-in
visitors.

**Source:** `fluent-cart-pro/app/Modules/Reviews/Services/ReviewService.php:19`

**Usage:**
```php
add_filter('fluent_cart/review/allow_threaded_replies', function ($enabled) {
    return true;
}, 10, 1);
```
</details>

---

## Response payloads

### <code> review/public_response </code>
<details>
<summary><code>fluent_cart/review/public_response</code> &mdash; The public review list, before it is returned</summary>

**When it runs:**
Runs at the end of the public reviews payload, which feeds both the REST endpoint
the storefront pages through and the first page rendered into the HTML. Reviewer
identity has **already** been redacted by the time it runs, so a listener sees the
names and avatars as the visitor will.

**Parameters:**
- `$responseData` (array): The paginated list
    ```php
    $responseData = [
        'reviews' => [
            'data'         => [...], // The rows on this page
            'current_page' => 1,
            'last_page'    => 4,
            'total'        => 37,
            // ... the rest of the paginator
        ],
    ];
    ```
- `$postId` (int): The product, or `0` for an all-products list.

**Returns:** The payload array. Keep the `reviews` paginator shape — the
storefront script reads `last_page` to build the pager and replaces the rows from
`data`.

**Source:** `app/Services/ProductReviewService.php:1429`

**Usage:**
```php
add_filter('fluent_cart/review/public_response', function ($responseData, $postId) {
    // Attach your own badge to each row for the storefront to render
    foreach ($responseData['reviews']['data'] as $index => $row) {
        $responseData['reviews']['data'][$index]['my_badge'] = my_addon_badge_for(
            (int) \FluentCart\Framework\Support\Arr::get($row, 'id')
        );
    }

    return $responseData;
}, 10, 2);
```
</details>

### <code> review/customer_reviews_response </code>
<details>
<summary><code>fluent_cart/review/customer_reviews_response</code> &mdash; The customer dashboard's My Reviews list</summary>

**When it runs:**
Runs at the end of the customer's own reviews payload, used by the My Reviews
screen in the customer portal. Each row already carries `product_title`,
`product_url` and `product_thumbnail`, and the internal id columns and the
reviewer's email have been hidden.

**Parameters:**
- `$responseData` (array): `['reviews' => <paginator array>]`, the same shape as [`review/public_response`](#review-public-response).
- `$context` (array): Read-only context
    ```php
    $context = [
        'customer' => $customer, // The customer whose reviews these are
    ];
    ```

**Returns:** The payload array.

**Source:** `app/Services/ProductReviewService.php:2055`

**Usage:**
```php
add_filter('fluent_cart/review/customer_reviews_response', function ($responseData, $context) {
    // Tell the customer how many of their reviews are still in the queue
    $pending = 0;

    foreach ($responseData['reviews']['data'] as $row) {
        if (\FluentCart\Framework\Support\Arr::get($row, 'status') === 'pending') {
            $pending++;
        }
    }

    $responseData['pending_count'] = $pending;

    return $responseData;
}, 10, 2);
```
</details>

### <code> review/admin_single_response </code>
<details>
<summary><code>fluent_cart/review/admin_single_response</code> &mdash; One review, as the admin screen receives it</summary>

**When it runs:**
Runs at the end of the admin "view one review" endpoint, after the product's
storefront link and the line-item labels have been attached.

**Parameters:**
- `$responseData` (array): The review and its reply rule
    ```php
    $responseData = [
        'review'                 => $review, // ProductReview
        'allow_multiple_replies' => false,   // Whether the reply form stays open
    ];
    ```
- `$review` (`\FluentCart\App\Models\ProductReview`): The same review, for convenience.

**Returns:** The payload array. This is the hook that adds a module's own data to
the moderation sidebar — vote counts, attachments, anything keyed to the review.

**Source:** `app/Http/Controllers/ProductReviewController.php:192`

**Usage:**
```php
add_filter('fluent_cart/review/admin_single_response', function ($responseData, $review) {
    // Surface your own moderation signal beside the review
    $responseData['my_spam_score'] = my_addon_score_review($review->id);

    return $responseData;
}, 10, 2);
```
</details>

### <code> review/admin_submit_response </code>
<details>
<summary><code>fluent_cart/review/admin_submit_response</code> &mdash; The answer to an admin-written review</summary>

**When it runs:**
Runs at the end of the admin Add Review endpoint, after the review has been
written, after any files handed over by
[`review/admin_store_media`](../actions/reviews#review-admin-store-media) have
been stored, and after the row was re-read. An extension that did work during
those hooks reports on it here.

**Parameters:**
- `$payload` (array): The response
    ```php
    $payload = [
        'message' => 'Review added successfully',
        'review'  => $review, // ProductReview — re-read after the media hooks
    ];
    ```

**Returns:** The payload array.

**Source:** `app/Http/Controllers/ProductReviewController.php:156`

**Usage:**
```php
add_filter('fluent_cart/review/admin_submit_response', function ($payload) {
    $stored = count($payload['review']->media);

    if ($stored) {
        $payload['message'] .= sprintf(
            /* translators: %d: number of photos stored */
            _n(' %d photo attached.', ' %d photos attached.', $stored, 'my-addon'),
            $stored
        );
    }

    return $payload;
}, 10, 1);
```
</details>

### <code> review/submit_success_message </code>
<details>
<summary><code>fluent_cart/review/submit_success_message</code> &mdash; The thank-you message shown after a review is submitted</summary>

**When it runs:**
Runs on the storefront submission path, after the review has been written and the
events dispatched, as the response message is chosen. FluentCart picks between two
defaults depending on the status the review was stored with:

| Stored status | Default message |
|---|---|
| `approved` | Thank you for your review! |
| anything else | Thank you! Your review has been submitted and is pending approval. |

The message reaches the reviewer through
[`review/submit_response`](#review-submit-response), which runs afterwards and
carries it as the payload's `message`.

**Parameters:**
- `$message` (string): The default message for the status the review was stored with.
- `$review` (`\FluentCart\App\Models\ProductReview`): The row as saved. Read `status` from it rather than assuming the store auto-approves.

**Returns:** The message string. It is shown to the reviewer as-is, so translate
it with your own text domain.

**Source:** `app/Http/Controllers/FrontendControllers/ProductReviewFrontendController.php:595`

**Usage:**
```php
add_filter('fluent_cart/review/submit_success_message', function ($message, $review) {
    if ($review->status !== 'approved') {
        return __('Thanks! A moderator reads every review before it appears.', 'my-addon');
    }

    return __('Thanks! Your review is live on the product page.', 'my-addon');
}, 10, 2);
```
</details>


### <code> review/submit_response </code>
<details>
<summary><code>fluent_cart/review/submit_response</code> &mdash; The answer to a storefront submission or edit</summary>

**When it runs:**
Runs on both storefront write paths, immediately before the response is sent. The
fourth argument distinguishes them: `false` for a new review, `true` for an edit.

By this point the row has been re-read, so an extension that stored photos during
[`review/after_submit`](../actions/reviews#review-after-submit) can report what
happened to each part of what the visitor sent.

**Parameters:**
- `$payload` (array): The response. The shape differs slightly between the two paths.
    ```php
    // Creating a review
    $payload = [
        'message'  => 'Thank you for your review!',
        'review'   => $review,  // ProductReview — the saved row
        'media'    => [...],    // [['id' => .., 'url' => ..], ...]
        'can_edit' => true,     // Whether this visitor may edit it
    ];

    // Editing a review — 'review' is the update envelope, and there is no can_edit
    $payload = [
        'message' => 'Your review has been updated!',
        'review'  => ['message' => '...', 'data' => $review],
        'media'   => [...],
    ];
    ```
- `$review` (`\FluentCart\App\Models\ProductReview`): On create, the saved row. On an edit, the row **as it was before** the update.
- `$request`: The request.
- `$isUpdate` (bool): `false` for a new review, `true` for an edit.

**Returns:** The payload array. The form reads `message` and shows it to the
reviewer, and uses `media` to redraw its uploader.

**Source:** `app/Http/Controllers/FrontendControllers/ProductReviewFrontendController.php:621`

Also runs at `app/Http/Controllers/FrontendControllers/ProductReviewFrontendController.php:783` (the edit path, with `$isUpdate` as `true`).

**Usage:**
```php
add_filter('fluent_cart/review/submit_response', function ($payload, $review, $request, $isUpdate) {
    if (!$isUpdate) {
        $payload['my_next_step'] = __('Your review appears once a moderator reads it.', 'my-addon');
    }

    return $payload;
}, 10, 4);
```
</details>

### <code> review/sort_query </code>
<details>
<summary><code>fluent_cart/review/sort_query</code> &mdash; Add a sort order the built-in columns do not cover</summary>

**When it runs:**
Runs in both review list queries — the public and admin resource list, and the
admin filter service — before FluentCart applies its own ordering. It is handed
the **raw requested sort key**, not a column name, so a listener can recognise a
custom key before it would be discarded.

FluentCart sorts by `id`, `rating`, `created_at` or `reviewer_name` itself and
ignores anything else, so a custom key only ever produces the order a listener
applies here.

**Parameters:**
- `$query` (`Builder`): The review query.
- `$sortBy` (string): The requested sort key, as it arrived.
- `$sortOrder` (string): `ASC` or `DESC`.

**Returns:** The query builder.

**Source:** `api/Resource/ProductReviewResource.php:97`

Also runs from `app/Services/Filter/ReviewFilter.php:238` (the admin list).

**Usage:**
```php
add_filter('fluent_cart/review/sort_query', function ($query, $sortBy, $sortOrder) {
    if ($sortBy === 'length') {
        $query->orderByRaw('CHAR_LENGTH(review) ' . ($sortOrder === 'ASC' ? 'ASC' : 'DESC'));
    }

    return $query;
}, 10, 3);
```
</details>

### <code> review/sort_options </code>
<details>
<summary><code>fluent_cart/review/sort_options</code> &mdash; The entries in the storefront sort control</summary>

**When it runs:**
Runs where the reviews sort dropdown is built, on the rendered reviews section and
on the composed Review List block.

The key is what the storefront sends back as its sort request, in
`column-DIRECTION` form. A key added here needs a matching
[`review/sort_query`](#review-sort-query) listener to actually order by it.

**Parameters:**
- `$sortOptions` (array): Key to label
    ```php
    $sortOptions = [
        'created_at-DESC' => 'Newest',
        'created_at-ASC'  => 'Oldest',
        'rating-DESC'     => 'Highest Rating',
        'rating-ASC'      => 'Lowest Rating',
    ];
    ```

**Returns:** The options array. Order is preserved, and the first entry is the one
the control shows first.

**Source:** `app/Services/Renderer/ProductReviewRenderer.php:1638`

Also runs from `app/Hooks/Handlers/BlockEditors/ProductReviewList/InnerBlocks/InnerBlocks.php:500`.

**Usage:**
```php
add_filter('fluent_cart/review/sort_options', function ($sortOptions) {
    // Pair this with the review/sort_query example above
    $sortOptions['length-DESC'] = __('Most detailed', 'my-addon');

    return $sortOptions;
}, 10, 1);
```
</details>

---

## Reviewer privacy

These four decide how much of a reviewer's identity public surfaces show. They are
applied in one place for list rows and enforced again by each renderer, so a block
or shortcode setting cannot show what these turn off.

They apply to the public review list, the review thread and the thread modal. They
are not applied to the customer's own My Reviews list, to submit and update
responses, or to emails — those show the reviewer their own name.

### <code> review/show_reviewer_name </code>
<details>
<summary><code>fluent_cart/review/show_reviewer_name</code> &mdash; Store-wide switch for reviewer names</summary>

**When it runs:**
Runs wherever FluentCart asks whether public surfaces show reviewer names at all.
A block can hide the name; it cannot show one this turns off — the renderers
combine their own setting with this filter using AND.

Returning `false` wins over
[`review/reviewer_name_format`](#review-reviewer-name-format): the name is dropped
rather than formatted.

**Parameters:**
- `$show` (bool): Default `true`.

**Returns:** A boolean, cast. `false` blanks `reviewer_name` on public rows while
keeping the key, so a consumer reading the field still finds it.

**Source:** `app/Services/ProductReviewService.php:1718`

**Usage:**
```php
add_filter('fluent_cart/review/show_reviewer_name', function ($show) {
    return false;
}, 10, 1);
```
</details>

### <code> review/show_reviewer_avatar </code>
<details>
<summary><code>fluent_cart/review/show_reviewer_avatar</code> &mdash; Store-wide switch for reviewer avatars</summary>

**When it runs:**
Runs wherever FluentCart asks whether public surfaces show reviewer avatars.

Turning it off also drops the row's `photo` value, because the Gravatar URL
carries a hash of the reviewer's email address.

**Parameters:**
- `$show` (bool): Default `true`.

**Returns:** A boolean, cast. `false` blanks `photo` on public rows while keeping
the key.

**Source:** `app/Services/ProductReviewService.php:1727`

**Usage:**
```php
add_filter('fluent_cart/review/show_reviewer_avatar', function ($show) {
    // Avatars reach out to Gravatar; drop them on a privacy-first store
    return false;
}, 10, 1);
```
</details>

### <code> review/reviewer_name_format </code>
<details>
<summary><code>fluent_cart/review/reviewer_name_format</code> &mdash; How much of a reviewer's name public reviews show</summary>

**When it runs:**
Runs wherever a reviewer's name is about to be formatted for a public surface.
Applied at display time, so the stored name never changes and switching the format
re-renders every existing review.

Store replies keep their name whatever this returns — a reply is the store
speaking, not a reviewer.

**Parameters:**
- `$format` (string): Default `'full'`.

**Returns:** One of five formats. Anything else falls back to `full`. For
"Jordan Hughes":

| Format | Result |
|---|---|
| `full` | Jordan Hughes |
| `first` | Jordan |
| `first_initial` | Jordan H. |
| `anonymous` | Anonymous |
| `masked` | Jor***hes |

`masked` keeps up to three letters of the first name and the last three of the
last; when that would spell the whole name, only the first letter shows.

**Source:** `app/Services/ProductReviewService.php:1738`

**Usage:**
```php
add_filter('fluent_cart/review/reviewer_name_format', function ($format) {
    return 'first_initial';
}, 10, 1);
```
</details>

### <code> review/reviewer_display_name </code>
<details>
<summary><code>fluent_cart/review/reviewer_display_name</code> &mdash; The reviewer's name, after formatting</summary>

**When it runs:**
Runs at the end of the name formatter, after one of the five built-in formats has
been applied. This is the hook for a format the built-ins do not cover — the
`$format` in the context tells you which one produced the name you were handed, so
you can return a custom format name from
[`review/reviewer_name_format`](#review-reviewer-name-format) and recognise it
here.

Whitespace in the original name has already been collapsed. An empty name returns
before the filter, so `$display` is never empty.

**Parameters:**
- `$display` (string): The formatted name.
- `$context` (array): What it was made from
    ```php
    $context = [
        'name'   => 'Jordan Hughes', // The stored name, whitespace collapsed
        'format' => 'full',          // The format that produced $display
    ];
    ```

**Returns:** The name to show, cast to string.

**Source:** `app/Services/ProductReviewService.php:1786`

**Usage:**
```php
// Ask for a format of your own, then build it here
add_filter('fluent_cart/review/reviewer_name_format', function () {
    return 'initials';
}, 10, 1);

add_filter('fluent_cart/review/reviewer_display_name', function ($display, $context) {
    // 'initials' is not a built-in, so $format fell back to 'full'
    $parts = preg_split('/\s+/', $context['name']);
    $initials = array_map(function ($part) {
        return mb_strtoupper(mb_substr($part, 0, 1)) . '.';
    }, $parts);

    return implode(' ', $initials);
}, 10, 2);
```
</details>

---

## Rating thresholds

### <code> review/min_review_count </code>
<details>
<summary><code>fluent_cart/review/min_review_count</code> &mdash; How many reviews a product needs before its rating shows</summary>

**When it runs:**
Runs when a product card decides whether to draw its rating. The product's stored
review count must reach this number, and its average must reach
[`review/min_average_rating`](#review-min-average-rating), or no rating is drawn.

The default comes from the block's own `minReviewCount` attribute, so a filter
here sets a store-wide floor under whatever each block asks for.

**Parameters:**
- `$minimum` (int): The block's `minReviewCount` attribute, or `0`.
- `$context` (array): Where the question was asked
    ```php
    $context = [
        'product'    => $product,
        'post_id'    => 123,
        'attributes' => [...],  // The block or shortcode attributes
        'block'      => $block, // The block instance, or null
    ];
    ```

**Returns:** An integer. Clamped to `0` or more, so a negative value becomes "no
minimum".

**Source:** `app/Services/ProductReviewService.php:1640`

**Usage:**
```php
add_filter('fluent_cart/review/min_review_count', function ($minimum, $context) {
    // Never show a star rating built on fewer than three opinions
    return max(3, (int) $minimum);
}, 10, 2);
```
</details>

### <code> review/min_average_rating </code>
<details>
<summary><code>fluent_cart/review/min_average_rating</code> &mdash; The average a product needs before its rating shows</summary>

**When it runs:**
Runs beside [`review/min_review_count`](#review-min-review-count), in the same
product-card check. Both thresholds must be met.

**Parameters:**
- `$minimum` (float): The block's `minAverageRating` attribute, or `0`.
- `$context` (array): The same context as [`review/min_review_count`](#review-min-review-count).

**Returns:** A float. Clamped to the range `0.0`–`5.0`.

**Source:** `app/Services/ProductReviewService.php:1645`

**Usage:**
```php
add_filter('fluent_cart/review/min_average_rating', function ($minimum, $context) {
    // Hide the rating on anything averaging below three stars
    return max(3.0, (float) $minimum);
}, 10, 2);
```
</details>

### <code> review/list_min_rating </code>
<details>
<summary><code>fluent_cart/review/list_min_rating</code> &mdash; An editorial floor on which reviews a list shows</summary>

**When it runs:**
Runs when the reviews renderer and the Review List block resolve their minimum
rating, before the list is drawn. Reviews below the floor are left out, and the
star filter chips below it are not offered either.

**Parameters:**
- `$default` (int): The minimum already resolved from the block or shortcode, usually `0`.
- `$context` (array): Context only
    ```php
    $context = [
        'client_id' => '...', // The requesting client's identifier
        'post_id'   => 123,   // 0 on an all-products list
    ];
    ```

**Returns:** An integer from `1` to `5`. Anything outside that range — including
`0` and a non-numeric value — resolves to `0`, meaning every review is shown.

::: tip
`client_id` is context, not proof of anything. An integration that authenticates
its own callers should verify them before overriding the floor.
:::

**Source:** `app/Services/ProductReviewService.php:1603`

**Usage:**
```php
add_filter('fluent_cart/review/list_min_rating', function ($default, $context) {
    // Keep one-star reviews off the landing page, show everything elsewhere
    if (is_front_page()) {
        return 2;
    }

    return $default;
}, 10, 2);
```
</details>

---

## Rendering

### <code> review/renderer_options </code>
<details>
<summary><code>fluent_cart/review/renderer_options</code> &mdash; Every display setting of the reviews section</summary>

**When it runs:**
Runs in the reviews renderer's constructor, on the options merged from the block
or shortcode over FluentCart's defaults. It is the broadest of the rendering
filters: everything the section draws is decided from this array.

**Parameters:**
- `$options` (array): The resolved render options. Among them: `showSummary`, `summaryMode`, `showCount`, `showSortControls`, `minRating`, `paginationType` (`numbers`, `fraction` or `bullets`), `maxWords`, `viewMode` (`list`, `grid` or `slider`), `gridColumns`, `sliderSettings`, `mediaVisible`, `mediaWidth`, `mediaHeight`, `mediaFullWidth`, `showMeta`, `itemClass`.
- `$postId` (int): The product the section is being drawn for.

**Returns:** The options array.

::: tip
`grid`, `slider` and `masonry` arrangements are a Pro capability. Setting
`viewMode` here on a core-only install still resolves to the stacked list.
:::

**Source:** `app/Services/Renderer/ProductReviewRenderer.php:144`

**Usage:**
```php
add_filter('fluent_cart/review/renderer_options', function ($options, $postId) {
    // A consistent pager everywhere, whatever each block was configured with
    $options['paginationType'] = 'numbers';
    $options['maxWords'] = 60;

    return $options;
}, 10, 2);
```
</details>

### <code> review/container_data_attrs </code>
<details>
<summary><code>fluent_cart/review/container_data_attrs</code> &mdash; Add data attributes to the reviews container</summary>

**When it runs:**
Runs just before the reviews container element is printed. Each pair becomes a
`data-` attribute on that element, with both the name and the value escaped.

This is how a module tells its own storefront script what to do: the script reads
the attribute off the container it is bound to, rather than needing its own
inline script block.

**Parameters:**
- `$attrs` (array): Default empty. Keys are attribute names **without** the `data-` prefix.
- `$postId` (int): The product.
- `$options` (array): The resolved render options, as [`review/renderer_options`](#review-renderer-options) left them.

**Returns:** A flat key-value array. Values are printed as attribute text, so use
scalars — `'1'` and `''` rather than `true` and `false`.

**Source:** `app/Services/Renderer/ProductReviewRenderer.php:610`

**Usage:**
```php
add_filter('fluent_cart/review/container_data_attrs', function ($attrs, $postId, $options) {
    // Renders as data-my-addon-mode="compact"
    $attrs['my-addon-mode'] = 'compact';

    return $attrs;
}, 10, 3);
```
</details>

### <code> review/media_item_html </code>
<details>
<summary><code>fluent_cart/review/media_item_html</code> &mdash; The markup of one review attachment tile</summary>

**When it runs:**
Runs for each attachment tile in a review's media strip, in both the list rows and
the thread modal. The context says which surface asked, and whether this tile is
one of the ones hidden behind the "+ more" tile.

**Parameters:**
- `$html` (string): FluentCart's default tile markup.
- `$context` (array): Which tile, and where
    ```php
    $context = [
        'item'    => [...],     // The media reference: id, type, order
        'context' => 'list',    // 'list' or 'modal'
        'hidden'  => false,     // Whether this tile sits behind the "+ more" tile
    ];
    ```

**Returns:** The markup for the tile, cast to string. You are responsible for
escaping anything you add.

Returning an empty string drops the tile entirely, and it does not consume one of
the visible slots — the strip counts tiles that were drawn, not items it was
offered, so declining one lets the next take its place rather than leaving a gap.

**Source:** `app/Services/Renderer/ReviewThreadMarkup.php:164`

**Usage:**
```php
add_filter('fluent_cart/review/media_item_html', function ($html, $context) {
    // Only decorate the tiles the visitor can actually see
    if ($context['context'] === 'modal' || !empty($context['hidden'])) {
        return $html;
    }

    return '<div class="my-addon-tile">' . $html . '</div>';
}, 10, 2);
```
</details>

### <code> reviews/star_colors </code>
<details>
<summary><code>fluent_cart/reviews/star_colors</code> &mdash; The filled and empty star colours</summary>

**When it runs:**
Runs when FluentCart resolves the store-wide star colours. They are used by every
server-rendered rating — the reviews section, product cards, and the review
emails.

A `<style>` block is printed in `wp_head` only when the colours differ from the
defaults, so returning the defaults costs nothing.

Note the plural `reviews/` in this hook name, which it shares with
[`reviews/star_svg`](./products-and-pricing#reviews-star-svg).

**Parameters:**
- `$colors` (array): The defaults
    ```php
    $colors = [
        'filled' => '#f59e0b',
        'empty'  => '#d1d5db',
    ];
    ```

**Returns:** An array with `filled` and `empty`. Each value goes through
`sanitize_hex_color()` and is lower-cased; a value that is not a valid hex colour
falls back to the default for that key. A non-array return keeps both defaults.

**Source:** `app/Services/Renderer/ProductReviewRenderer.php:70`

**Usage:**
```php
add_filter('fluent_cart/reviews/star_colors', function ($colors) {
    $colors['filled'] = '#1d4ed8';

    return $colors;
}, 10, 1);
```
</details>

### <code> review/js_vars </code>
<details>
<summary><code>fluent_cart/review/js_vars</code> &mdash; The data handed to the review form's script</summary>

**When it runs:**
Runs when the review form's script data is assembled. The result is localised onto
the page as `window.fluentcart_review_vars`, so anything added here is readable by
your own script as long as it runs after `fluent-cart-review-form`.

**Parameters:**
- `$reviewVars` (array): The script data. `trans` holds the form's translated strings — among them `details_step_hint` and `photos_step_hint`.

**Returns:** The array to localise. Add your own top-level keys, and add to `trans`
rather than replacing it so the form's own strings survive.

**Source:** `app/Modules/Templating/AssetLoader.php:268`

**Usage:**
```php
add_filter('fluent_cart/review/js_vars', function ($reviewVars) {
    $reviewVars['my_addon'] = [
        'endpoint' => rest_url('my-addon/v1/review-extras'),
    ];

    $reviewVars['trans']['my_addon_hint'] = __('Photos help other buyers.', 'my-addon');

    return $reviewVars;
}, 10, 1);
```
</details>

### <code> single_product_page/show_reviews </code>
<details>
<summary><code>fluent_cart/single_product_page/show_reviews</code> &mdash; Whether a product page shows its reviews section</summary>

**When it runs:**
Runs when FluentCart decides whether to append the reviews section to a single
product page. The default is the store's own "show reviews in single page"
setting.

This is the page-level gate only. Whether reviews are accepted for a product, and
which reviews are shown, are decided elsewhere.

**Parameters:**
- `$show` (bool): The store setting, `true` unless it was turned off.
- `$postId`: The product.

**Returns:** A boolean, cast.

**Source:** `app/Modules/Templating/TemplateActions.php:381`

**Usage:**
```php
add_filter('fluent_cart/single_product_page/show_reviews', function ($show, $postId) {
    // Keep reviews off products in a category you do not collect them for
    if (has_term('made-to-order', 'product-categories', $postId)) {
        return false;
    }

    return $show;
}, 10, 2);
```
</details>

---

## Order review page

The order review page is the surface a customer reaches from the link in a
post-purchase email, to review what they bought.

### <code> order_review/can_view </code>
<details>
<summary><code>fluent_cart/order_review/can_view</code> &mdash; Whether an order's review page may be opened</summary>

**When it runs:**
Runs after FluentCart has resolved the order from the link's hash and confirmed
reviews are enabled for the store. It is the last gate before the page is drawn.

**Parameters:**
- `$canView` (bool): Default `true`.
- `$context` (array): The order in question
    ```php
    $context = [
        'order' => $order, // The Order the link resolved to
    ];
    ```

**Returns:** A boolean. `false` makes the page report itself unavailable.

**Source:** `app/Services/Renderer/OrderReviewRenderer.php:214`

**Usage:**
```php
add_filter('fluent_cart/order_review/can_view', function ($canView, $context) {
    // Stop asking for reviews on orders older than three months
    if (strtotime($context['order']->created_at) < strtotime('-3 months')) {
        return false;
    }

    return $canView;
}, 10, 2);
```
</details>

### <code> order_review/block_attributes </code>
<details>
<summary><code>fluent_cart/order_review/block_attributes</code> &mdash; The review form block built for each ordered line</summary>

**When it runs:**
Runs once per line item on the order review page, as FluentCart assembles the
attributes for the Write a Review button block it renders for that line.

The defaults are deliberate: `query_type` is `custom` so the block honours the
`product_id` it is given rather than looking for a current product, and `layout` is
`inline` so the customer sees every field at once instead of a wizard.

**Parameters:**
- `$attributes` (array): The block attributes
    ```php
    $attributes = [
        'query_type' => 'custom',
        'product_id' => 123,
        'container'  => 'modal',
        'layout'     => 'inline',
    ];
    ```
- `$context` (array): The line being drawn
    ```php
    $context = [
        'post_id' => 123,   // The product
        'item_id' => 45,    // The variation, or 0 for the product as a whole
        'order'   => $order,
    ];
    ```

**Returns:** The attributes array.

**Source:** `app/Services/Renderer/OrderReviewRenderer.php:583`

**Usage:**
```php
add_filter('fluent_cart/order_review/block_attributes', function ($attributes, $context) {
    // Open the form on the page rather than in an overlay
    $attributes['container'] = 'inline';

    return $attributes;
}, 10, 2);
```
</details>

---

## Photo limits <Badge type="warning" text="Pro" />

Each of the store's photo-review settings passes through a filter. All three
results are validated afterwards, so a filter can adjust a limit but cannot
switch photo reviews off through it.

### <code> review/max_photos_per_review </code>
<details>
<summary><code>fluent_cart/review/max_photos_per_review</code> &mdash; How many photos one review may carry</summary>

**When it runs:**
Runs whenever Pro resolves the per-review photo cap — when validating an upload,
and when capping the attachment ids carried on a submission.

**Parameters:**
- `$max` (int): The store's `max_photos_per_review` setting, default `5`.
- `$context` (array): Always empty. The argument is there so listeners keep one signature as context is added.

**Returns:** An integer, cast. **Floored at `1`**, so `0` or a negative value
still allows one photo.

**Source:** `fluent-cart-pro/app/Modules/Reviews/Services/ReviewMediaService.php:46`

**Usage:**
```php
add_filter('fluent_cart/review/max_photos_per_review', function ($max, $context) {
    return 10;
}, 10, 2);
```
</details>

### <code> review/max_photo_size </code>
<details>
<summary><code>fluent_cart/review/max_photo_size</code> &mdash; The size limit for one review photo</summary>

**When it runs:**
Runs whenever Pro resolves the per-photo size limit. The value is in **megabytes**,
both in and out, and a fraction is fine — `0.5` is 500 KB. FluentCart converts it
to bytes to compare a file against it.

**Parameters:**
- `$sizeMb` (float): The store's `max_photo_size_mb` setting, default `1`.
- `$context` (array): Always empty.

**Returns:** A float, cast, in megabytes. **Floored at `0.001`** — about a
kilobyte — so a filter cannot disable photo uploads by shrinking the limit to
nothing.

**Source:** `fluent-cart-pro/app/Modules/Reviews/Services/ReviewMediaService.php:65`

**Usage:**
```php
add_filter('fluent_cart/review/max_photo_size', function ($sizeMb, $context) {
    // 3 MB, for photos straight off a phone
    return 3.0;
}, 10, 2);
```
</details>

### <code> review/allowed_photo_types </code>
<details>
<summary><code>fluent_cart/review/allowed_photo_types</code> &mdash; Which image types a review photo may be</summary>

**When it runs:**
Runs whenever Pro resolves the allowed image types, which it then turns into mime
types for validation and into an extension map for the upload handler.

**Parameters:**
- `$types` (array|null): The store's `allowed_photo_types` setting. `null` or an empty value means the full supported set.
- `$context` (array): Always empty.

**Returns:** A list of type keys, or `null` for the full supported set. An empty
array or a non-array is treated as `null`.

Each key is **checked against the supported map** and anything unrecognised is
dropped, so a filter cannot introduce an unsupported type. The supported keys are:

| Key | Extensions | Mime type |
|---|---|---|
| `jpeg` | `jpg`, `jpeg` | `image/jpeg` |
| `png` | `png` | `image/png` |
| `gif` | `gif` | `image/gif` |
| `webp` | `webp` | `image/webp` |

If filtering leaves nothing recognised, the full supported set is used.

**Source:** `fluent-cart-pro/app/Modules/Reviews/Services/ReviewMediaService.php:87`

**Usage:**
```php
add_filter('fluent_cart/review/allowed_photo_types', function ($types, $context) {
    // Photographs only — no animated GIFs on review rows
    return ['jpeg', 'png', 'webp'];
}, 10, 2);
```
</details>

---

## Product JSON-LD

The product schema node carries the product's review summary and its most recent
reviews, so these filters belong to the reviews surface as much as to the product
page.

### <code> product/schema_enabled </code>
<details>
<summary><code>fluent_cart/product/schema_enabled</code> &mdash; Whether a product emits JSON-LD at all</summary>

**When it runs:**
Runs at the start of the product schema builder, before any of the node is
assembled. Returning `false` skips the work entirely, which is the cheaper way to
suppress output than emptying the node afterwards.

**Parameters:**
- `$enabled` (bool): Default `true`.
- `$context` (array): `['post_id' => int]`.

**Returns:** A boolean.

**Source:** `app/Services/Schema/ProductSchema.php:70`

**Usage:**
```php
add_filter('fluent_cart/product/schema_enabled', function ($enabled, $context) {
    // Your SEO plugin already emits a Product node for these
    return !has_term('syndicated', 'product-categories', $context['post_id']);
}, 10, 2);
```
</details>

### <code> product/json_ld </code>
<details>
<summary><code>fluent_cart/product/json_ld</code> &mdash; The whole product JSON-LD node</summary>

**When it runs:**
Runs once the node is fully assembled, including its offers and its reviews.

The node carries the store's `reviews_per_page` worth of approved top-level
reviews, newest first, capped at 20. Offers are capped at 100.

**Parameters:**
- `$schema` (array): The Product node, ready to print.
- `$context` (array): The product and its summary
    ```php
    $context = [
        'post_id' => 123,
        'summary' => [...], // The visible review summary
    ];
    ```

**Returns:** The node array. **Return an empty array to print nothing.**

::: tip
The reviewer privacy filters are not applied to this node — it carries the stored
reviewer names. Redact them here if your store hides names on the storefront.
:::

**Source:** `app/Services/Schema/ProductSchema.php:168`

**Usage:**
```php
// Suppress the node entirely
add_filter('fluent_cart/product/json_ld', '__return_empty_array');

// Or match the storefront's name format
add_filter('fluent_cart/product/json_ld', function ($schema, $context) {
    foreach ((array) ($schema['review'] ?? []) as $index => $review) {
        if (isset($review['author']['name'])) {
            $schema['review'][$index]['author']['name'] =
                \FluentCart\App\Services\ProductReviewService::formatReviewerName($review['author']['name']);
        }
    }

    return $schema;
}, 10, 2);
```
</details>

### <code> review/json_ld </code>
<details>
<summary><code>fluent_cart/review/json_ld</code> &mdash; The product JSON-LD node, filtered last</summary>

**When it runs:**
Runs immediately after [`product/json_ld`](#product-json-ld), on the same node and
with the same context, and is the **last** filter the node passes through before
it is printed.

The two are interchangeable for new code; prefer `product/json_ld`, whose name
matches what it filters. Use this one when you need to run after everything else.

**Parameters:**
- `$schema` (array): The Product node, as `product/json_ld` left it.
- `$context` (array): `['post_id' => int, 'summary' => array]`.

**Returns:** The node array.

**Source:** `app/Services/Schema/ProductSchema.php:171`

**Usage:**
```php
add_filter('fluent_cart/review/json_ld', function ($schema, $context) {
    // The last word on the node, whatever else filtered it
    unset($schema['aggregateRating']);

    return $schema;
}, 10, 2);
```
</details>

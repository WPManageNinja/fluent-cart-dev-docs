---
title: Review Action Hooks
description: Action hooks fired by FluentCart's product reviews — submission, moderation, deletion, the storefront form and the review thread modal.
---

# Reviews

Actions fired by the product reviews feature: the storefront submission and edit
flow (`app/Http/Controllers/FrontendControllers/ProductReviewFrontendController.php`),
the admin moderation screen (`app/Http/Controllers/ProductReviewController.php`),
the shared write path (`api/Resource/ProductReviewResource.php`), and the
storefront renderers under `app/Services/Renderer/`.

Reviews are stored in `fct_product_reviews`. A reply is a review row with a
`parent_id`; a store reply also carries `is_admin_reply`. Several hooks below turn
on that distinction, so it is worth keeping in mind.

Photo reviews, helpful votes and threaded replies are implemented by FluentCart
Pro's reviews module on top of these hooks. Where a hook exists specifically for
that pipeline it is marked <Badge type="warning" text="Pro" />.

---

## Submission and editing

### <code> review/after_submit </code>
<details open>
<summary><code>fluent_cart/review/after_submit</code> &mdash; Fires after a review row has been written</summary>

**When it runs:**
Fires once the review has been inserted, on both paths that create one: a
storefront submission, and a moderator adding a review by hand from the admin
screen. It runs before the `review_created` and `review_approved` events, so an
extension that still has work to do on the row — storing the photos that came
with the request, for example — does it here and the notifications built on those
events see the finished row.

The admin path deliberately fires the same hook rather than an admin-specific
one: it writes the same kind of row from the same kind of request.

**Parameters:**
- `$review` (`\FluentCart\App\Models\ProductReview`): The row as inserted.
- `$request`: The request the review came from.

**Source:** `app/Http/Controllers/FrontendControllers/ProductReviewFrontendController.php:577`

Also fires from `app/Http/Controllers/ProductReviewController.php:125` (admin Add Review).

**Usage:**
```php
add_action('fluent_cart/review/after_submit', function ($review, $request) {
    // Keep the source of each review for your own reporting
    update_post_meta($review->post_id, '_last_review_source', is_admin() ? 'admin' : 'storefront');
}, 10, 2);
```
</details>

### <code> review/after_update </code>
<details>
<summary><code>fluent_cart/review/after_update</code> &mdash; Fires after a customer edits their own review</summary>

**When it runs:**
Fires at the end of the storefront edit endpoint, after the row has been saved.
Only the customer edit path fires it — a moderator changing a review from the
admin screen fires [`review/admin_status_changed`](#review-admin-status-changed)
instead.

By the time this runs the status has already been re-moderated: on a store that
does not auto-approve, editing an approved review sends it back to `pending`.

**Parameters:**
- `$result` (array): The envelope `ProductReviewResource::update()` returned.
    ```php
    $result = [
        'message' => 'Review updated successfully',
        'data'    => $review, // ProductReview — the saved row
    ];
    ```
- `$request`: The request the edit came from.

**Source:** `app/Http/Controllers/FrontendControllers/ProductReviewFrontendController.php:771`

**Usage:**
```php
add_action('fluent_cart/review/after_update', function ($result, $request) {
    $review = \FluentCart\Framework\Support\Arr::get($result, 'data');

    if ($review && $review->status === 'pending') {
        // An edit put this review back in the queue — tell whoever moderates
        wp_mail(
            get_option('admin_email'),
            'Edited review awaiting approval',
            'Review #' . $review->id . ' was edited and needs another look.'
        );
    }
}, 10, 2);
```
</details>

### <code> review/admin_status_changed </code>
<details>
<summary><code>fluent_cart/review/admin_status_changed</code> &mdash; Fires when a moderator changes one review's status</summary>

**When it runs:**
Fires from the admin update endpoint when the request changed the status and the
new status differs from the old one. Single reviews only — a bulk approve or bulk
trash does not fire it.

The status is one of `approved`, `pending`, `spam` or `trash`.

**Parameters:**
- `$review` (`\FluentCart\App\Models\ProductReview`): The row as saved.
- `$oldStatus` (string): The status before the change.
- `$newStatus` (string): The status now stored.

**Source:** `app/Http/Controllers/ProductReviewController.php:234`

**Usage:**
```php
add_action('fluent_cart/review/admin_status_changed', function ($review, $oldStatus, $newStatus) {
    // Your own moderation log, so decisions can be audited later
    error_log(sprintf(
        'Review #%d on product %d: %s -> %s by user %d',
        $review->id,
        $review->post_id,
        $oldStatus,
        $newStatus,
        get_current_user_id()
    ));
}, 10, 3);
```
</details>

### <code> review/admin_store_media </code>
<details>
<summary><code>fluent_cart/review/admin_store_media</code> &mdash; Hands over files uploaded with an admin-written review <Badge type="warning" text="Pro" /></summary>

**When it runs:**
Fires from the admin Add Review endpoint, immediately after
[`review/after_submit`](#review-after-submit), and only when the request actually
carried files. The review row already exists at this point, so the files can be
stored against a real review id — there is no upload-first step and no claim
token to reconcile.

FluentCart answers the response with the row re-read after this hook, so a
listener that writes attachment references and a count onto the review will see
them reflected in what the admin screen gets back.

**Parameters:**
- `$data` (array): The review and its files
    ```php
    $data = [
        'review' => $review, // ProductReview — the row just inserted
        'files'  => [...],   // Always a list, even for a single upload
    ];
    ```

**Source:** `app/Http/Controllers/ProductReviewController.php:136`

**Usage:**
```php
add_action('fluent_cart/review/admin_store_media', function ($data) {
    $review = $data['review'];

    foreach ($data['files'] as $file) {
        // Store the bytes however you keep review attachments, then record
        // the reference on the review row itself
        error_log('Review #' . $review->id . ' attachment: ' . $file['name']);
    }
}, 10, 1);
```
</details>

### <code> review/reviewer_reply_submitted </code>
<details>
<summary><code>fluent_cart/review/reviewer_reply_submitted</code> &mdash; Fires when a customer replies in a review thread <Badge type="warning" text="Pro" /></summary>

**When it runs:**
Fires after a customer's reply to a review has been written, from Pro's review
thread endpoint. This is the customer's own follow-up, not the store's: a store
reply fires the [`review_replied`](#review-replied) event instead.

Threaded replies are off unless something turns them on — see
[`review/allow_threaded_replies`](../filters/reviews#review-allow-threaded-replies).

**Parameters:**
- `$reply` (`\FluentCart\App\Models\ProductReview`): The reply row as saved.
- `$review` (`\FluentCart\App\Models\ProductReview`): The review being replied to.
- `$request`: The request the reply came from.

**Source:** `fluent-cart-pro/app/Modules/Reviews/Http/Controllers/ReviewThreadController.php:135`

**Usage:**
```php
add_action('fluent_cart/review/reviewer_reply_submitted', function ($reply, $review, $request) {
    // Let the moderators know a thread is still moving
    wp_mail(
        get_option('admin_email'),
        'New reply on review #' . $review->id,
        'A customer replied in the thread for product ' . $review->post_id . '.'
    );
}, 10, 3);
```
</details>

---

## Deletion

### <code> review/before_delete </code>
<details>
<summary><code>fluent_cart/review/before_delete</code> &mdash; Fires for each review about to be deleted</summary>

**When it runs:**
Fires inside the database transaction that deletes the review, once per row — a
single delete fires it once, a bulk delete once for each review selected. It does
not fire for the replies that are removed along with their parent.

Because it runs **inside** the transaction and before the rows are gone, this is
where to read anything you will need afterwards: the review's own attachment
references, its vote rows, anything keyed to its id. Use
[`review/after_delete`](#review-after-delete) to act on what you captured, once
the delete has actually committed.

**Parameters:**
- `$review` (`\FluentCart\App\Models\ProductReview`): The row about to be deleted.

**Source:** `api/Resource/ProductReviewResource.php:468`

Also fires from `api/Resource/ProductReviewResource.php:537` (bulk delete, once per row).

**Usage:**
```php
add_action('fluent_cart/review/before_delete', function ($review) {
    // $review->media is [['id' => 123, 'type' => ..., 'order' => ...], ...].
    // Capture the ids now; the row is gone after the commit.
    $pending = (array) get_option('my_plugin_review_cleanup', []);
    $pending[$review->id] = wp_list_pluck($review->media, 'id');
    update_option('my_plugin_review_cleanup', $pending, 'no');
}, 10, 1);
```
</details>

### <code> review/after_delete </code>
<details>
<summary><code>fluent_cart/review/after_delete</code> &mdash; Fires once after the delete has committed</summary>

**When it runs:**
Fires after the transaction commits, once per operation rather than once per row:
a single delete hands over a one-item list, a bulk delete hands over every review
it removed. It does not fire if the delete failed and rolled back.

The models in the payload describe rows that no longer exist. They are there so a
listener can finish work it prepared in
[`review/before_delete`](#review-before-delete).

**Parameters:**
- `$data` (array): The deleted reviews
    ```php
    $data = [
        'reviews' => [...], // ProductReview[] — the rows that were removed
    ];
    ```

**Source:** `api/Resource/ProductReviewResource.php:486`

Also fires from `api/Resource/ProductReviewResource.php:570` (bulk delete, once for the batch).

**Usage:**
```php
add_action('fluent_cart/review/after_delete', function ($data) {
    $pending = (array) get_option('my_plugin_review_cleanup', []);

    foreach ($data['reviews'] as $review) {
        foreach ((array) ($pending[$review->id] ?? []) as $attachmentId) {
            wp_delete_attachment((int) $attachmentId, true);
        }
        unset($pending[$review->id]);
    }

    update_option('my_plugin_review_cleanup', $pending, 'no');
}, 10, 1);
```
</details>

---

## Review events

These are dispatched through FluentCart's event dispatcher, which runs its
listeners and then fires the hook with the event's payload array
(`app/Events/EventDispatcher.php:28`). None of them write an activity row.

The approval and reply events each come in two halves. The event hook describes
the transition as it happened, on the request. The matching `_done` hook runs
later, off the request, having re-read the row and confirmed it is still
published. **Hang integrations on the `_done` hooks** — by the time those fire,
the media hooks have settled and the review is known to have stuck.

### <code> review_created </code>
<details>
<summary><code>fluent_cart/review_created</code> &mdash; A visitor submitted a review</summary>

**When it runs:**
Fires for a storefront submission, after the row is written and after
[`review/after_submit`](#review-after-submit). It does not fire for a review a
moderator wrote by hand, and it does not fire for a reply.

It fires whatever status the review was stored with, so a pending review fires it
too — this is "a review arrived", not "a review was published".

**Parameters:**
- `$data` (array): The review and its product
    ```php
    $data = [
        'review'  => $review,  // ProductReview
        'product' => $product, // The product it belongs to
    ];
    ```

**Source:** `app/Events/ReviewCreated.php:9`, dispatched from `app/Http/Controllers/FrontendControllers/ProductReviewFrontendController.php:589`

**Usage:**
```php
add_action('fluent_cart/review_created', function ($data) {
    $review = $data['review'];

    if ($review->status === 'pending') {
        // Count what is waiting, for a dashboard widget of your own
        update_option('my_plugin_reviews_awaiting', (int) get_option('my_plugin_reviews_awaiting', 0) + 1, 'no');
    }
}, 10, 1);
```
</details>

### <code> review_approved </code>
<details>
<summary><code>fluent_cart/review_approved</code> &mdash; A review became approved</summary>

**When it runs:**
Fires once per transition **into** the approved status, from every path that can
cause one: a moderator approving a single review, a bulk approve, a review born
approved because the store auto-approves, and a moderator writing one by hand.

It is the transition that fires, not the state. A review approved, held back and
approved again fires twice. It never fires for a reply, and never when the review
was already approved before the write.

For integrations, prefer [`review_approved_done`](#review-approved-done).

**Parameters:**
- `$data` (array): The review and its product
    ```php
    $data = [
        'review'  => $review,  // ProductReview — the approved review
        'product' => $product, // The product it belongs to
    ];
    ```

**Source:** `app/Events/ReviewApproved.php:24`, dispatched via `ReviewApproved::dispatchIfApproved()` from `app/Http/Controllers/FrontendControllers/ProductReviewFrontendController.php:585`, `app/Http/Controllers/ProductReviewController.php:153`, `api/Resource/ProductReviewResource.php:315` and `api/Resource/ProductReviewResource.php:614`

**Usage:**
```php
add_action('fluent_cart/review_approved', function ($data) {
    // Clear your own cached rating markup for this product right away
    delete_transient('my_plugin_rating_html_' . $data['review']->post_id);
}, 10, 1);
```
</details>

### <code> review_approved_done </code>
<details>
<summary><code>fluent_cart/review_approved_done</code> &mdash; An approval that stuck, off the request</summary>

**When it runs:**
Fires from an Action Scheduler job queued when [`review_approved`](#review-approved)
was dispatched. The job trusts nothing it was told: it re-reads the review and
fires only if the row is still there, still top-level, and still approved. A
review deleted or held back in the meantime announces nothing.

This is the hook to build an integration on. It runs after the media hooks have
settled, off the request, on a review that is known to be published.

**Parameters:**
- `$data` (array): The review and its product, re-read
    ```php
    $data = [
        'review'  => $review,  // ProductReview — with 'product' loaded
        'product' => $product,
    ];
    ```

**Source:** `app/Hooks/actions.php:217`

**Usage:**
```php
add_action('fluent_cart/review_approved_done', function ($data) {
    $review = $data['review'];

    // Push the published review to wherever you syndicate testimonials
    wp_remote_post('https://example.com/api/testimonials', [
        'timeout' => 15,
        'body'    => [
            'rating'  => (int) $review->rating,
            'title'   => (string) $review->title,
            'content' => (string) $review->content,
            'product' => (string) get_the_title($review->post_id),
        ],
    ]);
}, 10, 1);
```
</details>

### <code> review_replied </code>
<details>
<summary><code>fluent_cart/review_replied</code> &mdash; The store replied to a review</summary>

**When it runs:**
Fires once per store reply, from the two places that write one: a moderator
answering a single review, and a bulk reply. Only after the reply's transaction
has committed. It never fires for a customer's own follow-up in a thread — that
is [`review/reviewer_reply_submitted`](#review-reviewer-reply-submitted).

For integrations, prefer [`review_replied_done`](#review-replied-done).

**Parameters:**
- `$data` (array): The reply, the review it answers, and the product
    ```php
    $data = [
        'reply'   => $reply,   // ProductReview — the store's reply row
        'review'  => $review,  // ProductReview — the review being answered
        'product' => $product,
    ];
    ```

**Source:** `app/Events/ReviewReplied.php:23`, dispatched via `ReviewReplied::dispatchIfStoreReply()` from `app/Http/Controllers/ProductReviewController.php:375` and `api/Resource/ProductReviewResource.php:424`

**Usage:**
```php
add_action('fluent_cart/review_replied', function ($data) {
    // Your own record of how quickly the store answers
    $minutes = (time() - strtotime($data['review']->created_at)) / 60;
    error_log(sprintf('Review #%d answered after %d minutes', $data['review']->id, $minutes));
}, 10, 1);
```
</details>

### <code> review_replied_done </code>
<details>
<summary><code>fluent_cart/review_replied_done</code> &mdash; A store reply that stuck, off the request</summary>

**When it runs:**
Fires from an Action Scheduler job queued when [`review_replied`](#review-replied)
was dispatched. Announced only while both halves are still published: the reply
itself, and the review it answers. A reply to a review nobody can see is not a
conversation worth pointing the reviewer at.

**Parameters:**
- `$data` (array): The reply, the review and the product, re-read
    ```php
    $data = [
        'reply'   => $reply,   // ProductReview — with 'product' loaded
        'review'  => $review,  // ProductReview — the review answered
        'product' => $product,
    ];
    ```

**Source:** `app/Hooks/actions.php:247`

**Usage:**
```php
add_action('fluent_cart/review_replied_done', function ($data) {
    // Mirror the published exchange into your own help-desk thread
    my_helpdesk_append_note(
        (int) $data['review']->id,
        'Store replied: ' . wp_strip_all_tags((string) $data['reply']->content)
    );
}, 10, 1);
```
</details>

---

## Storefront rendering

These fire while FluentCart prints the reviews section. Two of them are read
through an output buffer, so a listener contributes by **echoing** markup rather
than returning it.

### <code> review/after_section </code>
<details>
<summary><code>fluent_cart/review/after_section</code> &mdash; Fires at the end of the reviews section</summary>

**When it runs:**
Fires as the last thing inside the reviews container, after the list, the form and
the thread modal shell have all been printed. Because it only runs when the
section was actually drawn, it is a reliable place to enqueue assets that are
only needed on a page showing reviews.

**Parameters:**
- `$postId` (int): The product the section was drawn for. `0` on an all-products list.

**Source:** `app/Services/Renderer/ProductReviewRenderer.php:778`

**Usage:**
```php
add_action('fluent_cart/review/after_section', function ($postId) {
    // Only loaded on pages that really show reviews
    wp_enqueue_style('my-addon-reviews');
    wp_enqueue_script('my-addon-reviews');
}, 10, 1);
```
</details>

### <code> review/form_extra_fields </code>
<details>
<summary><code>fluent_cart/review/form_extra_fields</code> &mdash; Add fields to the review form <Badge type="warning" text="Pro" /></summary>

**When it runs:**
Fires inside the submission form, inside an output buffer — **echo** your markup.
It is skipped when the visitor must log in first, so a listener never prints into
a form that is only showing a login prompt.

Whether this hook produced any output decides the form's shape: non-empty output
adds a further step to the stepped form. This is how Pro's photo uploader becomes
the Photos step.

The review the form is bound to arrives as the third argument. That matters:
deriving "this visitor's review" from product and user alone gets it wrong in two
ways the renderer already handles — a reply matches those columns too, and so does
the same person's review of a different variation.

**Parameters:**
- `$postId` (int): The product being reviewed.
- `$editableUserId` (int): The user whose review this form may edit.
- `$existingReview` (`\FluentCart\App\Models\ProductReview`|null): The row the form is editing, or `null` when writing a new review.

**Source:** `app/Services/Renderer/ProductReviewRenderer.php:947`

**Usage:**
```php
add_action('fluent_cart/review/form_extra_fields', function ($postId, $editableUserId, $existingReview) {
    // Your own storage, keyed on the review the form is bound to — null here
    // means the form is writing a new review rather than editing one.
    $value = $existingReview
        ? (string) get_post_meta($postId, '_my_addon_context_' . $existingReview->id, true)
        : '';

    printf(
        '<label class="my-addon-field">%s<input type="text" name="purchase_context" value="%s" /></label>',
        esc_html__('What did you buy this for?', 'my-addon'),
        esc_attr($value)
    );
}, 10, 3);
```
</details>

### <code> review/after_form_section </code>
<details>
<summary><code>fluent_cart/review/after_form_section</code> &mdash; Fires at the end of the review form</summary>

**When it runs:**
Fires as the last thing inside the form's own container, after the form, its
trigger and any overlay have been printed. Unlike
[`review/form_extra_fields`](#review-form-extra-fields) this is outside the field
area and outside the buffer, so it is for work beside the form rather than fields
within it.

**Parameters:**
- `$postId` (int): The product the form was drawn for.

**Source:** `app/Services/Renderer/ProductReviewRenderer.php:1024`

**Usage:**
```php
add_action('fluent_cart/review/after_form_section', function ($postId) {
    wp_enqueue_script('my-addon-review-form');
}, 10, 1);
```
</details>

### <code> review/filter_chips </code>
<details>
<summary><code>fluent_cart/review/filter_chips</code> &mdash; Add a chip to the review filter row</summary>

**When it runs:**
Fires at the end of the star-rating chip row, after the All chip and the per-star
chips, and only when the chips are actually being shown. Echo your own chip markup
to add to the row.

The storefront script reads the chips' `data-filter-chip` attribute to filter the
list, so a chip that should drive the built-in filtering needs that attribute.

**Parameters:**
- `$postId` (int): The product the controls were drawn for.

**Source:** `app/Services/Renderer/ProductReviewRenderer.php:1648`

Also fires from `app/Hooks/Handlers/BlockEditors/ProductReviewList/InnerBlocks/InnerBlocks.php:758` (the composed Review List block's own filter row).

**Usage:**
```php
add_action('fluent_cart/review/filter_chips', function ($postId) {
    printf(
        '<button type="button" class="fct-filter-chip" data-filter-chip="verified" aria-pressed="false">%s</button>',
        esc_html__('Verified only', 'my-addon')
    );
}, 10, 1);
```
</details>

### <code> review/modal_footer </code>
<details>
<summary><code>fluent_cart/review/modal_footer</code> &mdash; Add controls to the review thread modal <Badge type="warning" text="Pro" /></summary>

**When it runs:**
Fires in the footer of the server-rendered review thread modal, which the
storefront requests when a visitor opens a review. Echo your markup.

The payload is a single array rather than a bare model, so keys can be added later
without changing a listener's signature.

**Parameters:**
- `$payload` (array): The review the modal is showing
    ```php
    $payload = [
        'review' => $review, // ProductReview
    ];
    ```

**Source:** `app/Services/Renderer/ReviewModalRenderer.php:101`

**Usage:**
```php
add_action('fluent_cart/review/modal_footer', function ($payload) {
    printf(
        '<a class="my-addon-report" href="%s">%s</a>',
        esc_url(add_query_arg('report_review', (int) $payload['review']->id, home_url('/contact/'))),
        esc_html__('Report this review', 'my-addon')
    );
}, 10, 1);
```
</details>

### <code> review/submission_form_assets_loaded </code>
<details>
<summary><code>fluent_cart/review/submission_form_assets_loaded</code> &mdash; Fires once the review form's own assets are enqueued</summary>

**When it runs:**
Fires at the end of the asset loader's review-form routine, so a listener knows
FluentCart's own form CSS and JS are already queued and can register against them
— as a dependency, or with inline script that assumes the form script is present.

**Parameters:**
- `$context` (array): Always an empty array. The hook carries a payload argument so listeners keep one signature as context is added later.

**Source:** `app/Modules/Templating/AssetLoader.php:211`

**Usage:**
```php
add_action('fluent_cart/review/submission_form_assets_loaded', function () {
    wp_enqueue_script(
        'my-addon-review-extras',
        plugins_url('assets/review-extras.js', __FILE__),
        ['fluent-cart-review-form'],
        '1.0.0',
        true
    );
}, 10, 1);
```
</details>

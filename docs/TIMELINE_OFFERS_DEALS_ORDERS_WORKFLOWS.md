# Timeline Quick Actions, Offers, Deals, and Orders

## Scope and architecture

This document describes the frontend behavior currently implemented in this repository. The backend implementation is not present here, so backend side effects are documented only when the frontend explicitly invokes them or expects them in a response.

The Timeline page is assembled as follows:

1. `TimelinePage` gets the selected email from `TimelineContext`.
2. `ContactHeader` renders `ActionButton`, which is the **Quick Actions** section.
3. `LatestMessage` renders message-reply shortcuts (AI reply, templates, first reply, and emoji).
4. `MailerSummaryHeader` fetches offer, deal, order, and invoice records for the selected email and provides create/view/fetch/sync entry points.
5. `TimelineEvent` fetches ledger entries and renders the activity timeline.

There are three request wrappers:

| Wrapper | Destination | Authentication/configuration |
|---|---|---|
| `fetchGpc` | The configured `CRMENDPOINT` | `X-Api-Key`; automatically adds `db_name` and `dash_user_email` query parameters when configured |
| `http` / `smartGateway` | `<CRM base>?entryPoint=smart_gateway` | Generated `X-Api-Token`; `http` can also use the fixed Rightee CRM host |
| `apiRequest` | An explicit URL supplied by the caller | No default auth header; automatically adds `db_name` and `dash_user_email` when configured |

The main reusable side-effect helpers in `src/services/utils.js` are:

| Helper | Request | Result |
|---|---|---|
| `applyHashtag` | `fetchGpc`, query `type=hashtag`, `email`, `memo_no`, `domain`; HTTP `GET` to apply or `DELETE` to remove | Invalidates all contact queries. Errors are logged but swallowed. |
| `updateActivity` | `POST fetchGpc`, query `type=last_activity`; body contains email, activity text, current user's name/email | Invalidates all contact queries. Errors are logged but swallowed. |
| `createLedgerEntry` | `POST fetchGpc`, query `type=make_ledger`; body contains email, thread/message IDs, group, items, and optional reminder/websites | Invalidates all ledger queries and rethrows errors. |
| `buildLedgerItem` | No request | Builds ledger item fields, including `status`, `detail`, `parent_name`, and current assigned user ID. |

## Timeline Quick Actions

### Quick Actions endpoint and placement

The circular Quick Actions grid is `src/components/ActionButton.jsx`, mounted by `ContactHeader`. It is separate from the template reply shortcuts in `LatestMessage`.

### Action behavior and side effects

| Action | Primary operation | Hashtag behavior | Other effects |
|---|---|---|---|
| IP | Navigates to `/ip-manager` | None | No API call from the Quick Actions component. |
| Mark Tag | Opens a dropdown; selecting a tag calls `fetchGpc` with `type=hashtag`, current email, selected `memo_no`, and `domain=false` | `GET` if the contact does not currently have the tag; `DELETE` if it does | On mutation success, records `last_activity` as `Tag Applied` even when a tag was removed; invalidates contact queries and closes the dropdown. |
| Move To | Opens a folder/label dropdown from `MoveToDropdown` | None | Selection calls the CRM `move` entry point with the current thread and label IDs. |
| Favourite | Calls the CRM `contactAction` entry point with `field=favorite` and email | Memo `4`; `GET` when activating, `DELETE` when deactivating | `toggleFav` shows a toast, records `Email Favorited` or `Email Unfavorited`, and invalidates contact and favourite queries. The toggle and hashtag calls are started independently. |
| Assign | Opens the CRM-user dropdown; confirmation dispatches `forwardEmail(email, userId)` | Memo `5`, always `GET` | `POST fetchGpc type=assigned_task`; records `Email Assign`; creates an Activity ledger item with status `Forward-To`. The hashtag call is started separately from the assignment request. |
| Link Exchange | Toggles the contact's `exchange` field through the CRM `contactAction` entry point | Memo `6`; `GET` when activating, `DELETE` when deactivating | Records link/unlink activity and creates an Activity ledger entry (`Mark-Link-Exchange` or `Unmark-Link-Exchange`). Hashtag method is chosen from the contact's pre-click state. |
| Add/Remove Marketplace | Adds through `POST fetchGpc type=setMarketPlace` or removes through `POST fetchGpc type=removeMarketPlace` | Memo `1`, `domain=true`; `GET` on add and `DELETE` on remove | Records last activity, creates `Marketplace-Added`/`Marketplace-Removed` ledger entries. For Brand contacts, the email domain is submitted; otherwise the email is used. |
| Stop/Resume Emails | Calls `fetchGpc` with `type=force_stop`, contact ID, `new_value`, and current user's email | Memo `7`; `GET` when stopping, `DELETE` when resuming | Records `Email Stopped`/`Email Resumed`, invalidates moved-email queries, and shows a toast. |
| Add Notes | Opens a user search and note editor; submits `POST fetchGpc type=team_notes` with recipient email and an HTML note | None | Note HTML includes sender information and a contact redirect URL. It does not create a ledger entry or update last activity in this component. |

### Quick Action dropdown sources

| Dropdown | Source | Transformation/filtering |
|---|---|---|
| Mark Tag | `useMarkTags` -> smart gateway `POST`, `{ action: "fetch", module: "outr_hashtag", filters: { is_locked: "0" }, page: 1, per_page: 50 }` | Deduplicates records by tag `name`; displays `name`; submits `memo_c`. Current membership is read from `contact.hashtag.data.hashtags`. |
| Move To | `GET <crm>/index.php?entryPoint=move` via `SocketContext.getMoveOptions()` | Uses `response.labels`; displays `label.name`; submits `label.id`. Options are fetched every time the dropdown is opened. |
| Assign | `useCrmUsers` -> `GET fetchGpc type=get_users` | Excludes the current user and the contact's current assignee. Displays user name and submits user ID. The same response also initializes the global current-user object. |
| Add Notes recipient | `getRighteeUsers` -> `GET https://crm.outrightsystems.org/index.php?entryPoint=trynow&team_member=1` | Client-side case-insensitive name search; displays name/email and submits email. This is a different user source from Assign. |

### Latest Message shortcuts (not the Quick Actions grid)

`LatestMessage` also contains these shortcuts:

| Shortcut | Options/source | Behavior |
|---|---|---|
| AI Reply | `useMailerSummary` | Opens the reply flow with `mailers_summary.ai_response` and `addActivity=true`. The pencil/sparkle control opens the prompt ledger. |
| AI Summary | No working backend action in this component | Currently displays `Feature Coming Soon.`; its edit control opens the prompt ledger. |
| Configured quick buttons | `GET fetchGpc type=quick_actions`, cached for five minutes | Each returned button is treated as either `Ask Budget` or the fallback `Sorry`. The corresponding template is fetched by name and used as reply HTML. The edit control navigates to that template in Settings. |
| Done Conversation | Updates the current Contact through smart gateway `{ module: "Contacts", action: "update", id, data }` | Sets `conversation_complete` to `"1"`, immediately shows success, and advances to the next email. |

## Shared dropdown and template sources for offer, deal, and order flows

| Data | Source | Used by |
|---|---|---|
| Website options | `GET fetchGpc type=get_websites`; UI uses `response.data` | Create Offer and Create Deal |
| Existing offers | `GET fetchGpc type=get_offers&email=<email>&page=1&page_size=50` | Timeline summaries, offer view/edit, Create Offer filtering, Create Deal context |
| Existing deals | `GET fetchGpc type=get_deals&email=<email>&page=1&page_size=50` | Timeline summaries, deal view/edit, Create Offer/Deal filtering |
| Existing orders plus order dropdown metadata | `GET fetchGpc type=get_orders&email=<email>&page=1&page_size=50` | Timeline summaries and Edit Order. `order_status_list` populates Status; `invoice_type_list` populates Payment Type. |
| Offer email template | `useTemplateByName("OfferORG")` | Save & Send after offer creation |
| Deal email template | `useTemplateByName("DealORG")` | Save & Send after deal creation |
| Guest Post order template | `useTemplateByName("OrderORG")` | Save & Send / Update & Send for guest-post orders |
| Link Insertion order template | `useTemplateByName("LI_ORDER_TEMPLATE")` | Save & Send / Update & Send for link-insertion orders |

## Offers

CRM module names used are `outr_offer` for records and `Contacts` for the related contact.

### Fetch

There are two active fetch styles:

1. Per-contact/timeline fetch: `GET fetchGpc type=get_offers`, with email, page `1`, and page size `50`. `useOffersByEmail` caches it under `offerKeys.byEmail(email)`.
2. Main paginated list: smart gateway `POST` with action `fetch`, module `outr_offer`, selected fields, page, and table preference filters/sort/search. `useInfiniteOffers` reads pages until `page === total_pages` and caches for five minutes.

Stats use smart gateway action `get_stats` with queries for `active`, `expired`, and `accepted`. Single-record fetch uses smart gateway action `get_offer` with an ID.

### Create

The Create Offer screen:

1. Gets the contact/thread, website list, existing offers, and existing deals.
2. Removes websites already present in a non-expired offer or any deal for the email.
3. Prevents choosing the same website twice within the new rows.
4. Requires website, client offer `>= 0`, and our offer `> 0`.
5. Dispatches the legacy Redux `createOffer` thunk.

The thunk sends `POST <CRM base>?entryPoint=get_offer` with:

- `records`: amount fields, website, contact email, thread ID, and name;
- `child_bean`: module `Contacts` and the email from the first offer row.

After the primary request succeeds it:

- reports success in Redux;
- applies hashtag memo `8` using `GET`;
- creates an Offer ledger entry per website with status `Our-Offer-Created`;
- records last activity `Offer Created`.

The screen invalidates all offer queries when it observes the success message. Save navigates back. Save & Send builds a website/amount table into `OfferORG` and opens the reply flow.

### Update

`ThreadOffers` dispatches the legacy `updateOffer({ offers })` thunk. For each changed offer it sends:

`POST <CRM base>?entryPoint=get_post_all&action_type=post_data`

with `parent_bean.module = "outr_offer"` and the offer fields, plus `CREATE_DEAL_API_KEY`.

After initiating all record updates, the thunk updates Redux state, applies hashtag memo `13`, records `Offer Updated`, invalidates offer queries, and creates `Our-Offer-Updated` ledger items.

Important: record updates are launched inside `forEach(async ...)` and are not awaited. The success state and side effects can therefore run before every backend update finishes, and a late record-level failure may not reach the thunk's `catch`.

### Delete

`ThreadOffers` dispatches the legacy delete thunk, which sends `fetchGpc` with query parameters `type=delete_record`, `module_name=outr_offer`, and `record_id=<id>`.

On success it removes the record from legacy Redux state, applies hashtag memo `12` using `GET`, records `Offer Deleted`, invalidates offer queries, and creates an `offer_deleted` ledger item.

There is also an API helper `deleteOffer(id)` using smart gateway action `delete_offer`, but the thread UI does not use it. `useDeleteOffer` wraps that helper for other consumers and only invalidates offer queries and shows a toast.

## Deals

The record/list module used by the frontend is `outr_deal_fetch`; ledger items use parent name `outr_deal`.

### Fetch

1. Per-contact/timeline fetch: `GET fetchGpc type=get_deals`, with email, page `1`, and page size `50`.
2. Main paginated list: smart gateway `POST`, action `fetch`, module `outr_deal_fetch`, selected fields, page size `20`, page, and table preferences.
3. Stats: smart gateway action `get_stats`, querying `active` and `expire` and summing `dealamount`.
4. Message-based sync/fetch: `POST fetchGpc type=sync_opr` with email, message ID, and `sync_type="deal"`.
5. Single-record helper: smart gateway request with query `action=getDeal` and body `{ id }`.

### Create

The Create Deal screen obtains website options from `type=get_websites` and removes websites used by non-expired deals. It also prevents duplicates within the new rows. Every row requires a website and a positive amount.

It dispatches `createDeal`, which sends `POST <CRM base>?entryPoint=get_deal_details` with mapped records (`amount`, `email`, `website`, and `thread_id`) and a `Contacts` child bean containing contact ID and email.

On success it:

- applies hashtag memo `14` with `GET`;
- records `Deal Created`;
- creates `Deal-Created` ledger items with website and amount;
- sets a Redux success message.

The screen invalidates offer and deal queries when it observes success. Save navigates back; Save & Send inserts a deal table into `DealORG` and opens the reply flow.

### Update

`ThreadDeals` dispatches `updateDeal({ deals })`. It:

1. Extracts the email from `real_name` or `email` on the first deal.
2. Sends each note through `POST fetchGpc type=take_notes` with `record_id`, note, and `type1="deals"`.
3. Sends each record through `POST <CRM base>?entryPoint=get_post_all&action_type=post_data`, with `parent_bean.module="outr_deal_fetch"` and `CREATE_DEAL_API_KEY`.
4. Applies hashtag memo `15` with `GET`.
5. Records `Deal Updated` and creates `Deal-Updated` ledger items.

Both per-record loops use `forEach(async ...)` and are not awaited, so Redux success and downstream side effects may occur before note/record requests finish.

### Delete

The thread UI sends `POST fetchGpc type=delete_record` with module `outr_deal_fetch` and record ID. On success it removes the deal from legacy Redux state, applies hashtag memo `16`, records `Deal Deleted`, invalidates deal queries, and creates a `Deal-Deleted` ledger item.

There is a second `deleteDeal` API helper using smart gateway query `action=deleteDeal` with body `{ id }`; `useDeleteDeal` wraps that path. The thread UI uses the legacy thunk instead.

## Orders

The order CRM module is `outr_order_gp_li`; child SEO backlinks use `outr_seo_backlinks`.

### Fetch

1. Per-contact/timeline fetch: `GET fetchGpc type=get_orders`, with email, page `1`, and page size `50`. The response supplies `data`, `order_status_list`, and `invoice_type_list`.
2. Legacy Redux fetch: the same `type=get_orders` endpoint, optionally with a timeline filter and pagination. Brand mode instead calls `type=brandTimeline&case=order` and reads `response.data.order`.
3. Main paginated list: smart gateway `POST`, action `fetch`, module `outr_order_gp_li`, page, and table preferences.
4. Single order: smart gateway `POST`, action `fetch`, module `outr_order_gp_li`, filter `{ id }`.
5. Stats: smart gateway action `get_stats` with status queries for new, accepted, pending, wrong, completed, rejected nontechnical, listacle, marketplace type, and all; amount queries sum `total_amount_c`.
6. Message-based sync/fetch: `POST fetchGpc type=sync_opr` with email, message ID, and `sync_type="order"`.

The Timeline summary only counts orders whose status is not `wrong`, `rejected_nontechnical`, or `completed`.

### Create manually from the form

`CreateOrders` supports two locally defined choices: `GUEST POST` and `LINK INSERTION`.

- Guest Post rows require website and document URL.
- Link Insertion rows require website, backlink URL, and anchor text.
- These website fields are free-text inputs; unlike offers/deals, this screen does not use the website endpoint dropdown.

It dispatches `createOrder2`, which maps form rows into backend order shapes and sends `POST fetchGpc type=manual_order` with email, thread ID, current assigned user ID, and the mapped orders array.

On success it applies hashtag memo `17`, records `Manual Order Created`, and sets the Redux success message. The screen invalidates order queries. Save navigates back; Save & Send renders either `OrderORG` or `LI_ORDER_TEMPLATE` and opens the reply flow.

### Fetch/create an order from email data

From the Timeline order summary, an empty-order click or the `Fetch Order` button dispatches `createOrder(email, message_id?)`. It calls:

`GET <CRM base>?entryPoint=manual_order&email=<email>&assigned_user_id=<currentUserId>[&message_id=...]`

On successful `data.order.success`, it applies hashtag memo `17`, invalidates order queries, and records `Order Created`.

`createOrder3` is another batch path that calls the same `manual_order` entry point once per supplied order with email, message ID, website, and amount. It then applies memo `17` and records `Order Fetched`. No current component in the inspected create/edit flow dispatches this function.

### Update

The Edit Order screen gets the order and its dropdown maps from `get_orders` by email. It allows editing amount, status, payment type, order type, invoice link, and note.

On Update or Update & Send it dispatches the legacy `updateOrder` thunk, which:

1. Sends the note through `POST fetchGpc type=take_notes` with order ID and note.
2. Sends the order through `POST <CRM base>?entryPoint=get_post_all&action_type=post_data`, with `parent_bean.module="outr_order_gp_li"` and `CREATE_DEAL_API_KEY`.
3. Applies hashtag memo `18` with `GET`.
4. Records `Order Updated`.
5. Creates an Order ledger item. Status is `Order-Accepted`, `Order-Rejected`, or `Order-Completed` for those states; otherwise it is `Order-Updated`.

The screen invalidates all order queries when it sees the Redux message. Update navigates back; Update & Send opens a reply generated from the applicable order template.

There is also a React Query `updateOrder` API helper using smart gateway query `action=updateOrder`, but the Edit Order screen uses the Redux thunk. In `useUpdateOrder`, the detail invalidation checks `variables.id`; the helper's declared input shape is `{ order }`, so callers using that exact shape will not invalidate a specific order key.

### Delete

There is no order-record delete operation exposed in the inspected frontend. Deletion exists only for a child SEO backlink:

- `POST fetchGpc type=delete_record`, module `outr_seo_backlinks`, record ID;
- removes the link from legacy Redux state;
- applies hashtag memo `19`;
- records `Order Link Deleted`.

### SEO backlink create/update

| Operation | Endpoint/module | Side effects |
|---|---|---|
| Create link | `POST <CRM base>?entryPoint=get_post_all&action_type=post_data`; parent `outr_order_gp_li`, child `outr_seo_backlinks` | Updates legacy Redux state, applies memo `18`, records `Order Link Created`. |
| Update link | Same entry point; parent bean module `outr_seo_backlinks` | Updates legacy Redux state, invalidates order queries, records `Order Link Updated`; no hashtag call. |
| Delete link | `POST fetchGpc type=delete_record`, module `outr_seo_backlinks` | Updates legacy Redux state, applies memo `19`, records `Order Link Deleted`. |

## Hashtag memo map

These are numeric CRM memo identifiers; the frontend does not contain the human-readable hashtag names.

| Memo | Trigger |
|---:|---|
| 1 | Marketplace add/remove (`domain=true`) |
| 4 | Favourite add/remove |
| 5 | Assign contact/email |
| 6 | Link Exchange add/remove |
| 7 | Stop/resume future emails |
| 8 | Offer created |
| 12 | Offer deleted |
| 13 | Offer updated |
| 14 | Deal created |
| 15 | Deal updated |
| 16 | Deal deleted |
| 17 | Order created/fetched |
| 18 | Order updated or SEO backlink created |
| 19 | SEO backlink deleted |

Mark Tag is dynamic and uses the selected tag record's `memo_c` instead of a constant.

## Important implementation observations

1. The repo mixes React Query APIs and legacy Redux thunks. The create/edit thread screens currently use Redux thunks, while list/detail/stat fetching is primarily React Query.
2. Most hashtag, activity, and ledger calls happen only after the primary call succeeds, but several are not awaited. A UI success does not guarantee every secondary side effect succeeded.
3. `applyHashtag` catches and suppresses its own errors. Primary create/update/delete operations can appear successful even if hashtag application fails.
4. Offer and deal bulk updates use non-awaited async `forEach` callbacks, allowing premature success and incomplete error handling.
5. Quick Action Mark Tag always records `Tag Applied` after a successful mutation, including removal.
6. Offer creation builds the Contacts child bean email from `offers[0].email`, while the form rows shown initialize only website and amount fields; this value may be undefined even though the outer `email` argument exists.
7. `createOrder3` assigns to `data` without declaring it and launches requests inside a non-awaited `map`; it is unsafe if activated without correction.
8. `createLink` calls `applyHashtag` with an `email` variable that is not declared in that thunk, so that side effect would fail if the path runs.
9. The source comments contain outdated memo descriptions in a few order methods. The table above reflects the memo numbers actually passed in executable code.
10. No order-record deletion API is wired into the inspected UI; only order SEO backlink deletion exists.

## Source map

| Concern | Main files |
|---|---|
| Timeline composition | `src/components/pages/TimelinePage.jsx`, `src/context/TimelineContext.jsx`, `src/components/TimelineEvent.jsx` |
| Quick Actions | `src/components/ActionButton.jsx`, `src/components/MoveToDropdown.jsx`, `src/components/UserDropDown.jsx`, `src/context/SocketContext.jsx` |
| Latest Message shortcuts | `src/components/LatestMessage.jsx`, `src/queries/quickBtn.queries.js` |
| Shared request/side effects | `src/services/api.js`, `src/services/utils.js` |
| Offers | `src/components/pages/offers/*`, `src/store/Slices/offers.js`, `src/api/offers.api.js`, `src/queries/offers.queries.js` |
| Deals | `src/components/pages/deals/*`, `src/store/Slices/deals.js`, `src/api/deals.api.js`, `src/queries/deals.queries.js` |
| Orders | `src/components/pages/orders/*`, `src/store/Slices/orders.js`, `src/api/orders.api.js`, `src/queries/orders.queries.js` |
| Dropdown data | `src/api/marktag.api.js`, `src/api/users.api.js`, `src/api/web.api.js` and their query hooks |

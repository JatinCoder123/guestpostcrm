import { BacklinksPage } from "./BacklinksPage";

const ADDED_LINKS_FILTER = { status_c: "Added" };

export function LinkRemovalPage() {
  return (
    <BacklinksPage
      title="Link Removal"
      fixedFilters={ADDED_LINKS_FILTER}
    />
  );
}

export default LinkRemovalPage;

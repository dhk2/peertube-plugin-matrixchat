import { EventContext } from "./event-context";
import { EventMapper } from "../event-mapper";
import { ISearchResult } from "../@types/search";
export declare class SearchResult {
    readonly rank: number;
    readonly context: EventContext;
    /**
     * Create a SearchResponse from the response to /search
     */
    static fromJson(jsonObj: ISearchResult, eventMapper: EventMapper): SearchResult;
    /**
     * Construct a new SearchResult
     *
     * @param rank -   where this SearchResult ranks in the results
     * @param context -  the matching event and its
     *    context
     */
    constructor(rank: number, context: EventContext);
}
//# sourceMappingURL=search-result.d.ts.map
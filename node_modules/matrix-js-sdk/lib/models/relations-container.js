"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RelationsContainer = void 0;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _relations = require("./relations");
var _event = require("./event");
/*
Copyright 2022 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

class RelationsContainer {
  // A tree of objects to access a set of related children for an event, as in:
  // this.relations.get(parentEventId).get(relationType).get(relationEventType)

  constructor(client, room) {
    this.client = client;
    this.room = room;
    (0, _defineProperty2.default)(this, "relations", new Map());
  }

  /**
   * Get a collection of child events to a given event in this timeline set.
   *
   * @param eventId - The ID of the event that you'd like to access child events for.
   * For example, with annotations, this would be the ID of the event being annotated.
   * @param relationType - The type of relationship involved, such as "m.annotation", "m.reference", "m.replace", etc.
   * @param eventType - The relation event's type, such as "m.reaction", etc.
   * @throws If `eventId</code>, <code>relationType</code> or <code>eventType`
   * are not valid.
   *
   * @returns
   * A container for relation events or undefined if there are no relation events for
   * the relationType.
   */
  getChildEventsForEvent(eventId, relationType, eventType) {
    var _this$relations$get, _this$relations$get$g;
    return (_this$relations$get = this.relations.get(eventId)) === null || _this$relations$get === void 0 ? void 0 : (_this$relations$get$g = _this$relations$get.get(relationType)) === null || _this$relations$get$g === void 0 ? void 0 : _this$relations$get$g.get(eventType);
  }
  getAllChildEventsForEvent(parentEventId) {
    var _this$relations$get2;
    const relationsForEvent = (_this$relations$get2 = this.relations.get(parentEventId)) !== null && _this$relations$get2 !== void 0 ? _this$relations$get2 : new Map();
    const events = [];
    for (const relationsRecord of relationsForEvent.values()) {
      for (const relations of relationsRecord.values()) {
        events.push(...relations.getRelations());
      }
    }
    return events;
  }

  /**
   * Set an event as the target event if any Relations exist for it already.
   * Child events can point to other child events as their parent, so this method may be
   * called for events which are also logically child events.
   *
   * @param event - The event to check as relation target.
   */
  aggregateParentEvent(event) {
    const relationsForEvent = this.relations.get(event.getId());
    if (!relationsForEvent) return;
    for (const relationsWithRelType of relationsForEvent.values()) {
      for (const relationsWithEventType of relationsWithRelType.values()) {
        relationsWithEventType.setTargetEvent(event);
      }
    }
  }

  /**
   * Add relation events to the relevant relation collection.
   *
   * @param event - The new child event to be aggregated.
   * @param timelineSet - The event timeline set within which to search for the related event if any.
   */
  aggregateChildEvent(event, timelineSet) {
    if (event.isRedacted() || event.status === _event.EventStatus.CANCELLED) {
      return;
    }
    const relation = event.getRelation();
    if (!relation) return;
    const onEventDecrypted = () => {
      if (event.isDecryptionFailure()) {
        // This could for example happen if the encryption keys are not yet available.
        // The event may still be decrypted later. Register the listener again.
        event.once(_event.MatrixEventEvent.Decrypted, onEventDecrypted);
        return;
      }
      this.aggregateChildEvent(event, timelineSet);
    };

    // If the event is currently encrypted, wait until it has been decrypted.
    if (event.isBeingDecrypted() || event.shouldAttemptDecryption()) {
      event.once(_event.MatrixEventEvent.Decrypted, onEventDecrypted);
      return;
    }
    const {
      event_id: relatesToEventId,
      rel_type: relationType
    } = relation;
    const eventType = event.getType();
    let relationsForEvent = this.relations.get(relatesToEventId);
    if (!relationsForEvent) {
      relationsForEvent = new Map();
      this.relations.set(relatesToEventId, relationsForEvent);
    }
    let relationsWithRelType = relationsForEvent.get(relationType);
    if (!relationsWithRelType) {
      relationsWithRelType = new Map();
      relationsForEvent.set(relationType, relationsWithRelType);
    }
    let relationsWithEventType = relationsWithRelType.get(eventType);
    if (!relationsWithEventType) {
      var _this$room, _ref, _timelineSet$findEven;
      relationsWithEventType = new _relations.Relations(relationType, eventType, this.client);
      relationsWithRelType.set(eventType, relationsWithEventType);
      const room = (_this$room = this.room) !== null && _this$room !== void 0 ? _this$room : timelineSet === null || timelineSet === void 0 ? void 0 : timelineSet.room;
      const relatesToEvent = (_ref = (_timelineSet$findEven = timelineSet === null || timelineSet === void 0 ? void 0 : timelineSet.findEventById(relatesToEventId)) !== null && _timelineSet$findEven !== void 0 ? _timelineSet$findEven : room === null || room === void 0 ? void 0 : room.findEventById(relatesToEventId)) !== null && _ref !== void 0 ? _ref : room === null || room === void 0 ? void 0 : room.getPendingEvent(relatesToEventId);
      if (relatesToEvent) {
        relationsWithEventType.setTargetEvent(relatesToEvent);
      }
    }
    relationsWithEventType.addEvent(event);
  }
}
exports.RelationsContainer = RelationsContainer;
//# sourceMappingURL=relations-container.js.map
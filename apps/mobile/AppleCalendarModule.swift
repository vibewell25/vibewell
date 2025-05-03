import Foundation
import EventKit

@objc(AppleCalendarModule)
class AppleCalendarModule: NSObject {
    private let eventStore = EKEventStore()
    
    @objc
    func requestAccess(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        eventStore.requestAccess(to: .event) { granted, error in
            if let error = error {
                reject("ERROR", "Failed to request calendar access", error)
                return
            }
            resolve(granted)
        }
    }
    
    @objc
    func addEvent(_ title: String, 
                 startDate: Date,
                 endDate: Date,
                 description: String?,
                 location: String?,
                 resolver resolve: @escaping RCTPromiseResolveBlock,
                 rejecter reject: @escaping RCTPromiseRejectBlock) {
        let event = EKEvent(eventStore: eventStore)
        event.title = title
        event.startDate = startDate
        event.endDate = endDate
        event.notes = description
        event.location = location
        event.calendar = eventStore.defaultCalendarForNewEvents
        
        do {
            try eventStore.save(event, span: .thisEvent)
            resolve(["eventId": event.eventIdentifier])
        } catch {
            reject("ERROR", "Failed to add event", error)
        }
    }
    
    @objc
    func updateEvent(_ eventId: String,
                    title: String,
                    startDate: Date,
                    endDate: Date,
                    description: String?,
                    location: String?,
                    resolver resolve: @escaping RCTPromiseResolveBlock,
                    rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let event = eventStore.event(withIdentifier: eventId) else {
            reject("ERROR", "Event not found", nil)
            return
        }
        
        event.title = title
        event.startDate = startDate
        event.endDate = endDate
        event.notes = description
        event.location = location
        
        do {
            try eventStore.save(event, span: .thisEvent)
            resolve(true)
        } catch {
            reject("ERROR", "Failed to update event", error)
        }
    }
    
    @objc
    func deleteEvent(_ eventId: String,
                    resolver resolve: @escaping RCTPromiseResolveBlock,
                    rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let event = eventStore.event(withIdentifier: eventId) else {
            reject("ERROR", "Event not found", nil)
            return
        }
        
        do {
            try eventStore.remove(event, span: .thisEvent)
            resolve(true)
        } catch {
            reject("ERROR", "Failed to delete event", error)
        }
    }
} 
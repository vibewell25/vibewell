#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AppleCalendarModule, NSObject)

RCT_EXTERN_METHOD(requestAccess:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(addEvent:(NSString *)title
                  startDate:(NSDate *)startDate
                  endDate:(NSDate *)endDate
                  description:(NSString *)description
                  location:(NSString *)location
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(updateEvent:(NSString *)eventId
                  title:(NSString *)title
                  startDate:(NSDate *)startDate
                  endDate:(NSDate *)endDate
                  description:(NSString *)description
                  location:(NSString *)location
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(deleteEvent:(NSString *)eventId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end 
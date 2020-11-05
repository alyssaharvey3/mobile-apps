//
//  ShareViewController.m
//  extension
//
//  Created by Rustem Mussabekov on 10/04/2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "ShareViewController.h"
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <MobileCoreServices/MobileCoreServices.h>
#import "AsyncStorage.h"
#import <WebKit/WebKit.h>

#if __has_include(<React/RCTUtilsUIOverride.h>)
    #import <React/RCTUtilsUIOverride.h>
#endif

NSExtensionContext* extensionContext;
RCTBridge* bridge;

@implementation ShareViewController

- (BOOL)isContentValid {
  return YES;
}

- (void)didSelectPost {
  [self.extensionContext completeRequestReturningItems:@[] completionHandler:nil];
}

- (NSArray *)configurationItems {
  return @[];
}

- (void)extractDataFromContext:(NSExtensionContext *)context withCallback:(void(^)(NSArray *values, NSString* contentType, NSException *exception))callback {
  //Gather all providers
  NSMutableArray *providers = [NSMutableArray new];
  for (NSExtensionItem *inputItem in context.inputItems) {
    for(NSItemProvider *provider in inputItem.attachments) {
      [providers addObject:provider];
    }
  }
  
  //Get all content from all providers
  [self extractAllFromProviders: providers withCallback:^(NSArray *urls, NSArray *files) {
    if ([urls count] > 0) {
      callback(urls, @"url", nil);
    } else if ([files count] > 0) {
      callback(files, @"file", nil);
    } else {
      callback(nil, nil, [NSException exceptionWithName:@"Error" reason:@"couldn't find provider" userInfo:nil]);
    }
  }];
}

- (void)extractAllFromProviders:(NSArray *)providers withCallback:(void(^)(NSArray *urls, NSArray *files))callback {
  NSMutableArray *urls = [NSMutableArray new];
  NSMutableArray *files = [NSMutableArray new];
  
  __block int index = 0;
  
  for (NSItemProvider *provider in providers) {
    //Is web page or file url
    if([provider hasItemConformingToTypeIdentifier:@"public.url"]) {
      [provider loadItemForTypeIdentifier:@"public.url" options:nil completionHandler:^(id<NSSecureCoding> item, NSError *error) {
        NSURL *url = (NSURL *)item;
        
        //webpage
        if ([url.scheme hasPrefix:@"http"])
          [urls addObject:[url absoluteString]];
        //file
        else{
          //get mimetype
          CFStringRef fileExtension = (__bridge CFStringRef)[url pathExtension];
          CFStringRef UTI = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, fileExtension, NULL);
          CFStringRef MIMEType = UTTypeCopyPreferredTagWithClass(UTI, kUTTagClassMIMEType);
          CFRelease(UTI);
          
          [files addObject:@{
            @"uri": [url absoluteString],
            @"name": [[url absoluteString] lastPathComponent],
            @"type": (__bridge_transfer NSString *)MIMEType
            }];
        }
        
        index++;
        if (index == [providers count]){
          callback(urls, files);
        }
      }];
    }
    
    //Is text
    else if ([provider hasItemConformingToTypeIdentifier:@"public.plain-text"]){
      [provider loadItemForTypeIdentifier:@"public.plain-text" options:nil completionHandler:^(id<NSSecureCoding> item, NSError *error) {
        NSString *text = (NSString *)item;
        
        NSDataDetector *detector = [NSDataDetector dataDetectorWithTypes:NSTextCheckingTypeLink
                                                                   error:nil];
        NSTextCheckingResult *result = [detector firstMatchInString:text
                                                            options:0
                                                              range:NSMakeRange(0, text.length)];
        
        if (result.resultType == NSTextCheckingTypeLink){
          [urls addObject:[result.URL absoluteString]];
        }
        
        index++;
        if (index == [providers count]){
          callback(urls, files);
        }
      }];
    }
    
    //Is image
    else if (@available(iOS 11.0, *) && [provider hasItemConformingToTypeIdentifier:@"public.image"]){
      [provider loadItemForTypeIdentifier:@"public.image" options:nil completionHandler:^(id<NSSecureCoding> item, NSError *error) {
        [provider loadDataRepresentationForTypeIdentifier:@"public.image" completionHandler:^(NSData * _Nullable data, NSError * _Nullable error) {
          NSString *name = [NSString stringWithFormat: @"%@", [NSNumber numberWithDouble:[[NSDate date] timeIntervalSince1970]] ];
          
          //Try to get real file name
          if ([(NSObject *)item isKindOfClass:[NSURL class]]){
            NSURL* url = (NSURL *)item;
            name = [[[url absoluteString] lastPathComponent] stringByDeletingPathExtension];
          }
          
          //Write to temp file
          UIImage *sharedImage = [UIImage imageWithData:data];
          NSString *filePath = [NSTemporaryDirectory() stringByAppendingPathComponent:name];
          NSString *fullPath = [filePath stringByAppendingPathExtension:@"jpeg"];
          [UIImageJPEGRepresentation(sharedImage, .9) writeToFile:fullPath atomically:YES];
          
          [files addObject:@{
                            @"uri": fullPath,
                            @"name": [NSString stringWithFormat:@"%@.%@", name, @"jpeg"],
                            @"type": @"image/jpeg"
                            }];
          
          index++;
          if (index == [providers count]){
            callback(urls, files);
          }
        }];
      }];
    }
    
    //Something other
    else {
      index++;
      if (index == [providers count]){
        callback(urls, files);
      }
    }
  }
}

- (void)initCookies {
  //Get saved shared cookies
  NSArray *cookies = [[NSHTTPCookieStorage sharedCookieStorageForGroupContainerIdentifier:@"group.io.raindrop.main"] cookies];
  
  if ([cookies count] > 0) {
    //remove any existing local cookies
    //in the future (maybe in June 2020) move this block out of this "if"
    NSHTTPCookieStorage *existing = [NSHTTPCookieStorage sharedHTTPCookieStorage];
    for (NSHTTPCookie *each in existing.cookies) {
      [existing deleteCookie:each];
    }
    
    for (NSHTTPCookie *cookie in cookies) {
      [[NSHTTPCookieStorage sharedHTTPCookieStorage] setCookie:cookie];
    }
  }
}

- (void)closeExtension {
  [AsyncStorage persist];
  
  [extensionContext completeRequestReturningItems:nil completionHandler:^(BOOL expired){
    self.view = nil;
    //[bridge invalidate];
    //bridge = nil;
    //exit(0);
  }];
}

//REACT------------------------
+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

//Constants
- (NSDictionary *)constantsToExport
{
  return @{};
}

RCT_EXPORT_MODULE();

- (void)viewDidLoad {
  [super viewDidLoad];

  [self initCookies];
  [AsyncStorage rewrite];
  
  extensionContext = self.extensionContext;
    
  if (!bridge)
    bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:nil];
  
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"extension"
                                            initialProperties:nil];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:0];
  
  #if __has_include(<React/RCTUtilsUIOverride.h>)
      [RCTUtilsUIOverride setPresentedViewController:self];
  #endif
  
  self.view = rootView;
}

- (void)viewDidDisappear:(BOOL)animated {
  [self closeExtension];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  #if DEBUG
    return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
  #else
    return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
  #endif
}

RCT_EXPORT_METHOD(close) {
  [self closeExtension];
}

RCT_REMAP_METHOD(data,
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  [self extractDataFromContext: extensionContext withCallback:^(NSArray* values, NSString* contentType, NSException* err) {
    if(err) {
      reject(@"error", err.description, nil);
    } else {
      resolve(@{
                @"type": contentType,
                @"values": values
                });
    }
  }];
}

@end

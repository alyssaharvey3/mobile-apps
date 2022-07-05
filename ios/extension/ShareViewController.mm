#import "ShareViewController.h"
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTUtilsUIOverride.h>
#import <React/RCTAppSetupUtils.h>
#import <MobileCoreServices/MobileCoreServices.h>
#import <WebKit/WebKit.h>

#if __has_include(<React/RCTUtilsUIOverride.h>)
#import <React/RCTUtilsUIOverride.h>
#endif

#if RCT_NEW_ARCH_ENABLED
#import <React/CoreModulesPlugins.h>
#import <React/RCTCxxBridgeDelegate.h>
#import <React/RCTFabricSurfaceHostingProxyRootView.h>
#import <React/RCTSurfacePresenter.h>
#import <React/RCTSurfacePresenterBridgeAdapter.h>
#import <ReactCommon/RCTTurboModuleManager.h>

#import <react/config/ReactNativeConfig.h>

@interface ShareViewController () <RCTCxxBridgeDelegate, RCTTurboModuleManagerDelegate> {
  RCTTurboModuleManager *_turboModuleManager;
  RCTSurfacePresenterBridgeAdapter *_bridgeAdapter;
  std::shared_ptr<const facebook::react::ReactNativeConfig> _reactNativeConfig;
  facebook::react::ContextContainer::Shared _contextContainer;
}
@end
#endif

UIViewController<RCTBridgeDelegate>* controller;
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
  NSString *title = @"";
  
  //Gather all providers
  NSMutableArray *providers = [NSMutableArray new];
  for (NSExtensionItem *inputItem in context.inputItems) {
    if ([inputItem attributedContentText].string) {
      NSURL *isUrl = [NSURL URLWithString:[inputItem attributedContentText].string];
      if (isUrl && isUrl.scheme && isUrl.host){
        NSLog(@"attributedContentText looks like url, ignore");
      }
      else
        title = [inputItem attributedContentText].string;
    }
    
    for(NSItemProvider *provider in inputItem.attachments) {
      [providers addObject:provider];
    }
  }
  
  //Get all content from all providers
  [self extractAllFromProviders: providers title:title withCallback:^(NSArray *urls, NSArray *files) {
    if ([urls count] > 0) {
      callback(urls, @"url", nil);
    } else if ([files count] > 0) {
      callback(files, @"file", nil);
    } else {
      callback(nil, nil, [NSException exceptionWithName:@"Error" reason:@"couldn't find provider" userInfo:nil]);
    }
  }];
}

- (void)extractAllFromProviders:(NSArray *)providers title:(NSString *)title withCallback:(void(^)(NSArray *urls, NSArray *files))callback {
  NSMutableArray *urls = [NSMutableArray new];
  NSMutableArray *files = [NSMutableArray new];
  __block NSUInteger index = 0;
  
  [providers enumerateObjectsUsingBlock:^(NSItemProvider *provider, NSUInteger idx, BOOL *stop)
   {
    [provider.registeredTypeIdentifiers enumerateObjectsUsingBlock:^(NSString *identifier, NSUInteger idx, BOOL *stop)
     {
      [provider loadItemForTypeIdentifier:identifier options:nil completionHandler:^(id<NSSecureCoding> item, NSError *error)
       {
        index += 1;
        
        //Safari inject script results
        if ([identifier isEqualToString:(NSString *)kUTTypePropertyList]){
          NSDictionary *inject = (NSDictionary *)item;
          NSDictionary *details = [inject objectForKey:NSExtensionJavaScriptPreprocessingResultsKey];
                    
          [urls addObject:details];
        }
        // is an URL - Can be a path or Web URL
        else if ([(NSObject *)item isKindOfClass:[NSURL class]]) {
          NSURL *url = (NSURL *)item;
          
          //webpage
          if ([url.scheme hasPrefix:@"http"])
            [urls addObject:@{
              @"link": [url absoluteString],
              @"title": [title containsString:[url absoluteString]] ? @"" : title //ignore title with links, usually garbage
            }];
          //file
          else{
            //get mimetype
            CFStringRef fileExtension = (__bridge CFStringRef)[url pathExtension];
            CFStringRef UTI = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, fileExtension, NULL);
            CFStringRef MIMEType = UTTypeCopyPreferredTagWithClass(UTI, kUTTagClassMIMEType);
            CFRelease(UTI);
            
            [files addObject:@{
              @"file": @{
                  @"uri": [url absoluteString],
                  @"name": [[url absoluteString] lastPathComponent],
                  @"type": (__bridge_transfer NSString *)MIMEType
              }
            }];
          }
        }
        // is a String
        else if ([(NSObject *)item isKindOfClass:[NSString class]]) {
          NSString *text = (NSString *)item;
          
          NSDataDetector *detector = [NSDataDetector dataDetectorWithTypes:NSTextCheckingTypeLink
                                                                     error:nil];
          NSTextCheckingResult *result = [detector firstMatchInString:text
                                                              options:0
                                                                range:NSMakeRange(0, text.length)];
          
          if (result.resultType == NSTextCheckingTypeLink){
            [urls addObject:@{
              @"link": [result.URL absoluteString],
              @"title": [title containsString:[result.URL absoluteString]] ? @"" : title //ignore title with links, usually garbage
            }];
          }
        }
        // is an Image
        else if ([(NSObject *)item isKindOfClass:[UIImage class]]) {
          UIImage *sharedImage = (UIImage *)item;
          NSString *path = [NSTemporaryDirectory() stringByAppendingPathComponent:@"image.png"];
          [UIImagePNGRepresentation(sharedImage) writeToFile:path atomically:YES];
          
          [files addObject:@{
            @"file": @{
                @"uri": [NSString stringWithFormat:@"%@%@", @"file://", path],
                @"name": @"image.png",
                @"type": @"image/png"
            }
          }];
        }
        
        if (index == [providers count]) {
          callback(urls, files);
        }
      }];
      
      // We'll only use the first provider
      *stop = YES;
    }];
  }];
}

- (void)initCookies {
  NSString *suiteName = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"AppGroup"];
  NSUserDefaults *defaults = [[NSUserDefaults alloc] initWithSuiteName:suiteName];
  
  NSData *cookieData = [defaults objectForKey:@"cookies"];
  if ([cookieData length] > 0) {
      NSArray *cookies = [NSKeyedUnarchiver unarchiveObjectWithData:cookieData];
      NSHTTPCookieStorage *storage = [NSHTTPCookieStorage sharedHTTPCookieStorage];

      for (NSHTTPCookie *cookie in cookies) {
          [storage setCookie:cookie];
       }
  }
}

- (void)closeExtension {
  dispatch_async( dispatch_get_main_queue(), ^{
    [extensionContext completeRequestReturningItems:nil completionHandler:^(BOOL expired){
      self.view = nil;
      bridge = nil;

      //close after a 100ms (to give some time for background tasks complete)
      double delayInSeconds = 0.1;
      dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delayInSeconds * NSEC_PER_SEC));
      dispatch_after(popTime, dispatch_get_main_queue(), ^(void){
        exit(0);
      });
    }];
  });
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

  RCTAppSetupPrepareApp(nil);
  
  [self initCookies];
  
  controller = self;
  extensionContext = self.extensionContext;
  
  if (!bridge)
    bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:nil];

  #if RCT_NEW_ARCH_ENABLED
    _contextContainer = std::make_shared<facebook::react::ContextContainer const>();
    _reactNativeConfig = std::make_shared<facebook::react::EmptyReactNativeConfig const>();
    _contextContainer->insert("ReactNativeConfig", _reactNativeConfig);
    _bridgeAdapter = [[RCTSurfacePresenterBridgeAdapter alloc] initWithBridge:bridge contextContainer:_contextContainer];
    bridge.surfacePresenter = _bridgeAdapter.surfacePresenter;
  #endif
  
  NSDictionary *initProps = [self prepareInitialProps];
  UIView *rootView = RCTAppSetupDefaultRootView(bridge, @"extension", initProps);
  
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:0];
  
  #if __has_include(<React/RCTUtilsUIOverride.h>)
    [RCTUtilsUIOverride setPresentedViewController:self];
  #endif
  
  self.view = rootView;
}

- (void)viewDidDisappear:(BOOL)animated {
  
  [self closeExtension];
}

/// This method controls whether the `concurrentRoot`feature of React18 is turned on or off.
///
/// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
/// @note: This requires to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the `concurrentRoot` feture is enabled. Otherwise, it returns `false`.
- (BOOL)concurrentRootEnabled
{
  // Switch this bool to turn on and off the concurrent root
  return true;
}
- (NSDictionary *)prepareInitialProps
{
  NSMutableDictionary *initProps = [NSMutableDictionary new];
#ifdef RCT_NEW_ARCH_ENABLED
  initProps[kRNConcurrentRoot] = @([self concurrentRootEnabled]);
#endif
  return initProps;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

#if RCT_NEW_ARCH_ENABLED
#pragma mark - RCTCxxBridgeDelegate
- (std::unique_ptr<facebook::react::JSExecutorFactory>)jsExecutorFactoryForBridge:(RCTBridge *)bridge
{
  _turboModuleManager = [[RCTTurboModuleManager alloc] initWithBridge:bridge
                                                             delegate:self
                                                            jsInvoker:bridge.jsCallInvoker];
  return RCTAppSetupDefaultJsExecutorFactory(bridge, _turboModuleManager);
}
#pragma mark RCTTurboModuleManagerDelegate
- (Class)getModuleClassFromName:(const char *)name
{
  return RCTCoreModulesClassProvider(name);
}
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const std::string &)name
                                                      jsInvoker:(std::shared_ptr<facebook::react::CallInvoker>)jsInvoker
{
  return nullptr;
}
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const std::string &)name
                                                     initParams:
                                                         (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return nullptr;
}
- (id<RCTTurboModule>)getModuleInstanceFromClass:(Class)moduleClass
{
  return RCTAppSetupDefaultModuleFromClass(moduleClass);
}
#endif

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(close) {
  [self closeExtension];
  return @"";
}

//disable swipe to dismiss
RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(disableDismissGesture) {
  if (@available(iOS 13.0, *)) {
    controller.modalInPresentation = TRUE;
  }
  return @"";
}

//enable swipe to dismiss
RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(enableDismissGesture) {
  if (@available(iOS 13.0, *)) {
    controller.modalInPresentation = FALSE;
  }
  return @"";
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

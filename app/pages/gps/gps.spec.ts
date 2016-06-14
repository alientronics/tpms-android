import { Gps } from './gps';
import { Geolocation, Toast } from 'ionic-native';
import { IonicApp, Platform, NavController } from 'ionic-angular';
import { Events }   from 'ionic-angular';
import { TranslateService, TranslateStaticLoader, TranslateLoader } from 'ng2-translate/ng2-translate';
import { UserData } from '../../providers/user-data';
import { GpsProvider } from '../../providers/gps';
import { Http, BaseRequestOptions } from 'angular2/http';
import { MockBackend } from 'angular2/http/testing'

let gps: Gps = null;
let gpsProvider: GpsProvider = null;

class MockClass {
  public backButton = { subscribe : () => {} }
  public getComponent(): any { return true; }
  public present(): any { return true; }
  public unsubscribe(): any { return true; }
}


function showToastStub(message: string, title: string, nav: NavController): any {
  'use strict';
  return null;
}

function publishStub(topic: string):any { return null; }

function watchPositionStub(options: any): any {
  'use strict';

  let watcher: Object = {
    subscribe: function(callback : any): void {
      let data = { 
        coords: { 
          latitude: 30.03,
          longitude: 51.22,
        }
      }
      return callback(data); 
    }
  };
  return watcher;
}


function postApiStub(options: any): any {
  'use strict';

  let watcher: Object = {
    subscribe: function(callback: any, error: any): void {
      return callback(); 
    }
  };
  return watcher;
}

function getBluetoothDataStub(): any {
  'use strict';

  let promise: Object = {
    then: function(callback: any): void {
      return callback(); 
    }
  };
  return promise;
}

describe('Gps', () => {

  beforeEach(() => {   
    let mockClass: any = (<any>new MockClass());
    let events: Events = new Events();
    let platform: Platform = new Platform();
    let http: Http = new Http(new MockBackend(), new BaseRequestOptions());
    let userData: UserData = new UserData(events, http, platform);
    spyOn(userData, 'showToast').and.callFake(showToastStub);
    spyOn(events, 'publish').and.callFake(publishStub);
    spyOn(Geolocation, 'watchPosition').and.callFake(watchPositionStub); 
    gpsProvider = new GpsProvider(events, platform, mockClass, userData);
    let translateLoad: TranslateLoader = new TranslateStaticLoader(http, 'assets/i18n', '.json');
    let translate: TranslateService = new TranslateService(http, translateLoad, null);
    gps = new Gps(gpsProvider, events, translate);
  });

  it('initialises', () => {
    expect(gps).not.toBeNull();
  });
  
  it('should start gps tracking', () => {
    gpsProvider.gpsToggle(true);
    expect(Geolocation.watchPosition).toHaveBeenCalled();
  });

  it('should subscribe gps location', () => {
    gpsProvider.gpsToggle(true);
    expect(gpsProvider['latitude']).toBe(30.03);
    expect(gpsProvider['longitude']).toBe(51.22);
  });

  it('should unsubscribe watcher', () => {
    gpsProvider.watcher = new MockClass();
    gpsProvider.gpsToggle(false);
    expect(gpsProvider.watcher).toBeNull();
  });
  
});
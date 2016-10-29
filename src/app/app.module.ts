import { NgModule } from '@angular/core';
import { Http, HttpModule } from '@angular/http';
import {BrowserModule} from "@angular/platform-browser";
import {TranslateModule, TranslateStaticLoader, TranslateLoader} from 'ng2-translate';

import { IonicApp, IonicModule } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { FleetanyApp } from './app.components';

import {TabsPage} from '../pages/tabs/tabs';
import {About} from '../pages/about/about';
import {Gps} from '../pages/gps/gps';
import {Bluetooth} from '../pages/bluetooth';
import {Login} from '../pages/login/login';

import {GeofenceProvider} from '../providers/geofence';
import {AlertsProvider} from '../providers/alerts';
import {GpsProvider} from '../providers/gps';
import {BluetoothProvider} from './providers/bluetooth';
import {UserData} from '../providers/user-data';

export function createTranslateLoader(http: Http) {
    return new TranslateStaticLoader(http, './assets/i18n', '.json');
}

@NgModule({
  declarations: [
    FleetanyApp,
    TabsPage,
    About,
    Gps,
    Bluetooth,
    Login
  ],
  imports: [
    IonicModule.forRoot(FleetanyApp),
    BrowserModule,
    HttpModule,
    TranslateModule.forRoot({ 
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [Http]
    })
  ],
  exports: [BrowserModule, HttpModule, TranslateModule],
  bootstrap: [IonicApp],
  entryComponents: [
    FleetanyApp,
    TabsPage,
    About,
    Gps,
    Bluetooth,
    Login
  ],
  providers: [
    UserData,
    GeofenceProvider,
    AlertsProvider,
    GpsProvider,
    BluetoothProvider,
    Storage
  ]
})
export class AppModule {}
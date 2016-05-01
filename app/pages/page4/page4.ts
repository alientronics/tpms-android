'use strict';

import {Page, Platform, Events, NavController} from 'ionic-angular';
import {UserData} from '../../providers/user-data';
import {BLE} from 'ionic-native';
import {Observable} from "rxjs/Observable";

@Page({
  templateUrl: 'build/pages/page4/page4.html'
})
export class Page4 {

  private events: Events;
  private blescan: boolean;
  private userData: UserData;
  private platform: Platform;
  private bledevice: string;
  private devices: Array<any>;
  private deviceData: string;
  private datastream: Array<any>;

  constructor(userData: UserData, platform: Platform, events: Events, public nav: NavController) {
    this.userData = userData;
    this.events = events;
    this.platform = platform;
  }

  bleToggle(value) {
    if (this.userData.plate == null) {
      this.userData.showToast('Vehicle should be selected!', 'Error!', this.nav);
    } else {
    	if (value) {
        this.datastream = [];
        this.events.publish('ble:on');
	    } else {
        this.events.publish('ble:off');
      }

	    if (this.platform.is('mobile')) {
	      this.bleToggleMobile(value);
	    } else {
	      this.bleToggleBrowser(value);
	    }
    }
  }

  bleToggleBrowser(value) {
    if (value) {
      this.bledevice = null;
      this.devices = [
        {id: '73:08:19:71:8C:9B'},
        {id: '73:08:19:71:8C:9C'},
        {id: '73:08:19:71:8C:9D'}
      ];
      setTimeout(() => {
          this.blescan = false;
          this.devices = [];
          this.datastream.push('scan stopped');
          console.log('scan stopped'); 
      }, 6000);      
    } else {
      this.devices = [];
    }
  }

  bleToggleMobile(value) {
    if (value) {
      if (this.bledevice) {
        BLE.disconnect(this.bledevice).then(() => {
          this.datastream.push('Disconnected');
          console.log('Disconnected');
        });
      }
      BLE.startScan([]).subscribe(
        device => {
          console.log(device.json());
          this.datastream.push(JSON.stringify(device.json()));
          this.devices.push(device.json());
        },
        err => {
          this.datastream.push(JSON.stringify(err));
          console.error(err);
        }
      );
      setTimeout(() => {
        BLE.stopScan().then(() => { 
          this.blescan = false;
          this.datastream.push('scan stopped');
          console.log('scan stopped'); 
        });
      }, 60000);
    } else {
      //
    }
  }
  
  bledeviceChanged(value) {
    if (this.platform.is('mobile')) {
      BLE.connect(value).subscribe(peripheralData => {
        this.datastream.push(peripheralData);
        console.log(peripheralData);
      },
      peripheralData => {
        console.log('disconnected');
      });
    } else {
      this.blescan = false;
      var data = [
        {temp: 35.40, pres: 105.27},
        {temp: 35.40, pres: 105.27},
        {temp: 35.40, pres: 105.27}
      ];
      this.datastream.push(JSON.stringify(data));
    }
  }

}

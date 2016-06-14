'use strict';

import {Injectable, Inject} from 'angular2/core';
import {Storage, Platform, LocalStorage, Events, Alert} from 'ionic-angular';
import {Geolocation, Toast, Network, Connection, Globalization} from 'ionic-native';
import {Http, Headers} from 'angular2/http';
import {Settings} from '../config/settings';

let settings: Settings = new Settings();
var JSZip = require("jszip");

@Injectable()
export class UserData {

  public storage: Storage;
  private HAS_LOGGED_IN: string;
  private JSON_OBJECT: string;
  private PLATE: string;
  private RAW_DATA: string;
  public data: any;
  public email: string;
  public userLang: string;
  public plate: number;
  private lastPosition: any;

  constructor(
      @Inject(Events) public events: Events,
      @Inject(Http) public http: Http,
      @Inject(Platform) public platform: Platform
  ) {
    this.storage = new Storage(LocalStorage);
    this.events = events;
    this.http = http;
    this.platform = platform;
    this.HAS_LOGGED_IN = 'hasLoggedIn';
    this.JSON_OBJECT = 'jsonObject';
    this.PLATE = 'plate';
    this.RAW_DATA = 'rawdata';
    this.lastPosition = {"latitude": null, "longitude": null};

    platform.ready().then(() => {
      if (this.platform.is('mobile')) {
        Globalization.getPreferredLanguage().then((language) => {
            this.userLang = language.value;
        });
      } else {
        this.userLang = 'en';
      }
    }); 
  }

  login(userObjet) {
    this.storage.set(this.HAS_LOGGED_IN, true);
    this.storage.set(this.JSON_OBJECT, JSON.stringify(userObjet));
    this.email = userObjet.email;
    this.events.publish('user:login');
    this.load();
  }

  logout() {
    this.storage.remove(this.HAS_LOGGED_IN);
    this.storage.remove(this.JSON_OBJECT);
    this.storage.remove(this.PLATE);
    this.storage.remove(this.RAW_DATA);
    this.data = null;
    this.events.publish('user:logout');
  }

  setPlate(plate) {
    this.storage.set(this.PLATE, plate);
    this.plate = plate;
    this.events.publish('user:changeplate');
  }

  getPlate() {
    return this.storage.get(this.PLATE).then((value) => {
      return value;
    });
  }

  // return a promise
  hasLoggedIn() {
    return this.storage.get(this.JSON_OBJECT).then((value) => {
      return value;
    });
  }

  load() {
    if (this.data) {
      // already loaded data
      return Promise.resolve(this.data);
    }

    if (this.hasLoggedIn()) {
      this.storage.get(this.RAW_DATA).then((value) => {
        return Promise.resolve(value);
      });
    }

    // don't have the data yet
    return new Promise(resolve => {
      // We're using Angular Http provider to request the data,
      // then on the response it'll map the JSON data to a parsed JS object.
      // Next we process the data and resolve the promise with the new data.

      this.postApi('user', {}).subscribe(res => {
        // we've got back the raw data, now generate the core schedule data
        // and save the data for later reference
        this.data = JSON.stringify(res.json());
        this.storage.set(this.RAW_DATA, this.data);
        resolve(this.data);
      },
      error => {
        alert('Error sending data: ' + error.statusText);
        console.log(error);
      }
      );

    });
  }

  getVehicles() {
    return this.load().then(data => {
      let dataP = JSON.parse(data);
      let vehicles = [];
      
      for (var i = 0; i < dataP.vehicles.length; i = i + 1) {
        vehicles.push({ "key": dataP.vehicles[i].id, "value": dataP.vehicles[i].number , "geofence": dataP.vehicles[i].geofence });
      }

      return vehicles.sort();
    });
  }

  getFuelTypes() {
    return this.load().then(data => {
      let dataP = JSON.parse(data);
      let fuelTypes = [];
      
      for (var i = 0; i < dataP.fuelTypes.length; i = i + 1) {
        fuelTypes.push({ "key": dataP.fuelTypes[i].id, "value": dataP.fuelTypes[i].name });
      }
    
      return fuelTypes.sort();
    });
  }
  
  postApi(url, data) {
    var headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    data['email'] = this.email;
    data['lang'] = this.userLang;
    data['api_token'] = settings.api_token;
    if (this.plate) data['vehicle_id'] = this.plate;
    var query = "";
    for (var key in data) {
      query += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
    }
    return this.http.post(settings.base_path + url, query , { headers} );
  }

  showToast(message, title, nav) {
    if (window.cordova) {
      Toast.show(message, "5000", "center").subscribe(
        toast => {
          console.log(toast);
        }
      );
    } else {
      let alert = Alert.create({
        title: title,
        message: message,
        buttons: ['Ok']
      });
     nav.present(alert);
    }
  }


  checkConnection() {
    if (this.platform.is('mobile') && Network.connection === Connection.NONE) {
      return false;
    } else {
      return true;
    }
  }

}
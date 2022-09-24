const {default: fetch} = require("node-fetch");

// {
//     "aircons": {
//       "ac1": {
//         "info": {
//           "constant1":1,            - Readonly - Constant zone 1 - the system will decide if this zone needs to be automatically opened to protect the ductwork (0 - disabled)
//           "constant2":2,            - Readonly - Constant zone 2 - the system will decide if this zone needs to be automatically opened to protect the ductwork (0 - disabled)
//           "constant3":0,            - Readonly - Constant zone 3 - the system will decide if this zone needs to be automatically opened to protect the ductwork (0 - disabled)
//           "countDownToOff": 0,      - Number of minutes before the aircon unit switches off (0 - disabled, max 720 minutes)
//           "countDownToOn": 0,       - Number of minutes before the aircon unit switches on (0 - disabled, max 720 minutes)
//           "fan": "high",            - Fan speed - can be "low", "medium" or "high". Note some aircon units also support "auto".
//           "freshAirStatus": "none", - Fresh Air status - can be set to "on" or "off". Note: not many aircon units have this fitted.
//           "mode": "heat",           - Mode - can be "heat", "cool" or "vent". Note some aircon units support "dry".
//           "myZone": 0,              - MyZone settings - can be set to any zone that has a temperature sensor (0 - disabled) see Extra information below for more information.
//           "name": "AirconHome",     - Name of aircon - max 12 displayed characters
//           "setTemp": 24.0,          - Set temperature of the aircon unit (min 16 - max 32) - this will show the MyZone set temperature if a MyZone is set.
//           "state": "on"             - Aircon unit state - whether the unit is "on" or "off".
//         },
//         "zones": {
//           "z01": {
//             "name": "FREEGGVFUX",   - Name of zone - max 12 displayed characters
//             "setTemp": 25.0,        - Set temperature of the zone (min 16 - max 32) - only valid when Zone type > 0.
//             "state": "open",        - State of the zone - can be "open" or "close". Note: that the
//             "type": 0,              - Readonly - Zone type - 0 means percentage (use value to change), any other number means it's temperature control, use setTemp.
//             "value": 20             - Percentage value of zone (min 5 - max 100, increments of 5)- only valid when Zone type = 0.
//           }
//         }
//       }
//     },
//     "system":{
//       "name":"MyPlaceSystem",       - Name of system - max 12 displayed characters
//       "needsUpdate":false,          - If true, you need to prompt user to update the apps on the Wall Mounted Touch Screen
//       "noOfAircons":1               - Number of aircon units - this can be 0-4.
//     }
// }

class MyAir {
  /**
   * @param {string} host
   */
  constructor(host, port = 2025, aircon = "ac1") {
    this._host = host;
    this._port = port;
    this._aircon = aircon;
    this._system = null;
    this._zones = [];
  }

  /**
   * @param {string} request
   */
  async _request(request) {
    let url = `http://${this._host}:${this._port}/${request}`;

    let response = await fetch(url);

    if (!response.ok) {
      throw new Error("Network response was not OK");
    }

    let data = await response.text();

    try {
      let entry = JSON.parse(data);
      return entry;
    } catch (err) {
      console.error(err);
    }
  }

  async update() {
    this._system = await this._request("getSystemData");
    return this._system;
  }

  get aircons() {
    return Object.keys(this._system["aircons"]);
  }

  /** Returns the list of zones for the chosen aircon */
  get zones() {
    if (!this._system) {
      throw new Error("Update function needs to be called first");
    }
    return this._system["aircons"][this._aircon]["zones"];
  }

  get zoneArray() {
    if (!this._system) {
      throw new Error("Update function needs to be called first");
    }
    let zoneArray = [];
    for (const zone in this.zones) {
      let entries = [["zone", zone]];
      entries = [...entries, ...Object.entries(this.zones[zone])];
      zoneArray.push(Object.fromEntries(entries));
    }
    this._zones = zoneArray
    return this._zones;
  }

  get info() {
    if (!this._system) {
      throw new Error("Update function needs to be called first");
    }
    return this._system["aircons"][this._aircon]["info"];
  }

  get mode() {
    let mode = this._system["aircons"][this._aircon]["info"]["mode"];
    let state = this._system["aircons"][this._aircon]["info"]["state"];
    if (state === "off") {
      return "off";
    } else if (state === "on") {
      return mode;
    }
  }

  get myzone() {
    return this._system["aircons"][this._aircon]["info"]["myZone"];
  }

  get fanspeed() {
    return this._system["aircons"][this._aircon]["info"]["fan"];
  }

  //   set zones(update) {
  //     let outputJson = `{"${this.aircon}": {"zones": ${JSON.stringify(update)}}}`
  //     let validJson = JSON.parse(outputJson);

  //     console.log(`setAircon?json=${JSON.stringify(validJson)}`);
  //   }
}

module.exports = MyAir;

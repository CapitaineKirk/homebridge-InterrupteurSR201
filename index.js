var Service;
var Characteristic;
var net = require('net');

const date = require('date-and-time');
const TCP_PORT = 6722;
const TCP_CMD_STATUS ="00";
const TCP_TIMEOUT = 500;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory('homebridge-InterrupteurSR201', 'InterrupteurSR201', InterrupteurSR201Accessory);
};

function InterrupteurSR201Accessory(log, config) {
  this.log = log;
  this.name = config.name;
  this.adresseIp = config.adresseIp;
  this.relais = config.relais;
  this.intervalLecture = config.intervalLecture || 1;
  this.debug = config.debug || 0;
  this.etatInterrupteurMemorise = false; //Etat initial
  this.etatInterrupteurDemandee = false; //Etat initial

  this.log('Fin InterrupteurSR201Accessory');
}

InterrupteurSR201Accessory.prototype.setOn = function(estOn, callback, context) {
  if (context === 'pollState') {
    // The state has been updated by the pollState command - don't run the open/close command
    callback(null);
    return;
  }

  var accessory = this;

  if(estOn) {
    accessory.etatInterrupteurDemande = true;
    accessory.log('Appel de setOn : True');
  } else {
    accessory.etatInterrupteurDemande = false;
    accessory.log('Appel de setOn : False');
  }

  if (accessory.stateTimer) {
    clearTimeout(accessory.stateTimer);
    accessory.stateTimer = null;
  }
  accessory.stateTimer = setImmediate(this.monitorState.bind(this));

  callback();
  return true;
};

InterrupteurSR201Accessory.prototype.getOn = function(callback) {
  var accessory = this;

  accessory.log('Appel de getOn');
  callback(null, accessory.etatInterrupteurMemorise);
}

InterrupteurSR201Accessory.prototype.handleEventConnect = function() {
  this.log('Evenement connexion');
  if (this.stateTimer) {
    clearTimeout(this.stateTimer);
    this.stateTimer = null;
  }
  this.stateTimer = setImmediate(this.queryState.bind(this));
}

InterrupteurSR201Accessory.prototype.handleEventTimeout = function() {
  this.log('Evenement timeout');
  this.socket.connect(TCP_PORT, this.adresseIp);
}

InterrupteurSR201Accessory.prototype.handleEventError = function(error) {
  this.log('Evenement error (' + error.code + ')');
}

InterrupteurSR201Accessory.prototype.handleEventClose = function() {
  this.log('Evenement close');
  this.socket.connect(TCP_PORT, this.adresseIp);
}

InterrupteurSR201Accessory.prototype.handleEventData = function(data) {
  if(this.debug) {
      this.log('Evenement data : ' + data);
    }

  try {
      this.lectureCapteur = data.toString('utf-8').substring(this.relais-1,this.relais);
  } catch(exception) {
      this.log("Erreur lecture de l'etat :" + exception.sdout);
      this.lectureCapteur = '';
  }
  if(this.debug) {
      this.log('Donnees : ' + this.lectureCapteur);
  }
  if (this.stateTimer) {
    clearTimeout(this.stateTimer);
    this.stateTimer = null;
  }
  this.stateTimer = setImmediate(this.monitorState.bind(this));
}

InterrupteurSR201Accessory.prototype.handleEventEnd = function() {
  this.log('Evenement end');
}

InterrupteurSR201Accessory.prototype.queryState = function() {
  if(this.debug) {
    this.log('Interrogation du capteur');
  }
  if(!this.socket.write(TCP_CMD_STATUS)){
    if(this.debug) {
      this.log('Interrogation ratee');
    }
    this.lectureCapteur = '';
    if (this.stateTimer) {
      clearTimeout(this.stateTimer);
      this.stateTimer = null;
    }
    this.stateTimer = setImmediate(this.monitorState.bind(this));
  } else {
    if(this.debug) {
      this.log('Interrogation reussie');
    }
  }
}

InterrupteurSR201Accessory.prototype.monitorState = function() {
  var accessory = this;
  var InterrupteurChange = false;
  var commande = '';
  
  if(accessory.debug) {
    if(accessory.etatInterrupteurMemorise) {
      accessory.log("etatInterrupteurMemorise = ON");
    } else {
      accessory.log("etatInterrupteurMemorise = OFF");
    }
  }

  switch(accessory.lectureCapteur) {
    case '1' :
      accessory.relaisActif = true;
      accessory.relaisEnDefaut = false;
      if(accessory.debug) {
        accessory.log('Etat du relais de ' + accessory.name + ' est (ON)');
      }
    break;
    case '0' :
      accessory.relaisActif = false;
      accessory.relaisEnDefaut = false;
      if(accessory.debug) {
        accessory.log('Etat du relais de ' + accessory.name + ' est (OFF)');
      }
    break;
    default :
      accessory.relaisEnDefaut = true;
      if(accessory.debug) {
        accessory.log('Etat du relais de ' + accessory.name + ' est (KO)');
      }
    break;
  }

  if(accessory.relaisEnDefaut) {
    accessory.log("Etat defaut de " + accessory.name);
    accessory.etatInterrupteurMemorise = false;
    accessory.Service.getCharacteristic(Characteristic.On).updateValue(false);
  } else {
    if(accessory.relaisActif) {
      if(!accessory.etatInterrupteurDemande) {
        accessory.log("Etat demande de " + accessory.name + " est : (OFF)");
        commande = '2' + this.relais;
        InterrupteurChange = true;
      } else {
        if(!accessory.etatInterrupteurMemorise) {
          accessory.log("Etat demande de " + accessory.name + " est : (ON)");
          accessory.log("Etat memorise de " + accessory.name + " etait : (OFF)");
          accessory.Service.getCharacteristic(Characteristic.On).updateValue(true);
          accessory.etatInterrupteurMemorise = true;
          accessory.log("Etat memorise de " + accessory.name + " est : (ON)");
        }
      }
    } else {
      if(accessory.etatInterrupteurDemande) {
        accessory.log("Etat demande de " + accessory.name + " est : (ON)");
        commande = '1' + this.relais;
        InterrupteurChange = true;
      } else {
        if(accessory.etatInterrupteurMemorise) {
          accessory.log("Etat demande de " + accessory.name + " est : (OFF)");
          accessory.log("Etat memorise de " + accessory.name + " etait : (ON)");
          accessory.Service.getCharacteristic(Characteristic.On).updateValue(false);
          accessory.etatInterrupteurMemorise = false;
          accessory.log("Etat memorise de " + accessory.name + " est : (OFF)");
        }
      }
    }
  }
  if(InterrupteurChange) {
    accessory.log('Commande envoye : ' + commande);
    try {
      accessory.socket.write(commande);
    } catch(exception) {
      accessory.log("Erreur d\'exécution de la commande : " + exception.sdout);
    }
  }

  if(accessory.debug) {
    accessory.log('Relance de queryState dans ' + accessory.intervalLecture * 1000 + 'ms');
  }
  // Clear any existing timer
  if (accessory.stateTimer) {
    clearTimeout(accessory.stateTimer)
    accessory.stateTimer = null;
  }
  accessory.stateTimer = setTimeout(this.queryState.bind(this),(accessory.intervalLecture) * 1000);
};

InterrupteurSR201Accessory.prototype.getServices = function() {
  this.log('Debut Getservices');
  this.informationService = new Service.AccessoryInformation();
  this.Service = new Service.Switch(this.name);

  this.informationService
  .setCharacteristic(Characteristic.Manufacturer, 'Fabrique du Capitaine Kirk')
  .setCharacteristic(Characteristic.Model, 'Interrupteur SR-201')
  .setCharacteristic(Characteristic.SerialNumber, '1.0.0');

  this.Service.getCharacteristic(Characteristic.On)
  .on('set', this.setOn.bind(this))
  .on('get', this.getOn.bind(this))
  .updateValue(this.etatInterrupteur);

  this.socket = new net.Socket();
  this.socket.setTimeout(TCP_TIMEOUT);
  this.socket.on('connect',this.handleEventConnect.bind(this))
  this.socket.on('timeout',this.handleEventTimeout.bind(this))
  this.socket.on('error',this.handleEventError.bind(this))
  this.socket.on('close',this.handleEventClose.bind(this))
  this.socket.on('data',this.handleEventData.bind(this))
  this.socket.on('end',this.handleEventEnd.bind(this))

  this.log('Connexion a ' + this.adresseIp);
  this.socket.connect(TCP_PORT, this.adresseIp);

  this.stateTimer = setTimeout(this.queryState.bind(this),this.intervalLecture * 1000);

  return [this.informationService, this.Service];
};



# homebridge-InterrupteurSR201
<img src="https://github.com/CapitaineKirk/homebridge-InterrupteurCommande/blob/master/photos/photo1.jpg" width=150 align="right" />  
<img src="https://github.com/CapitaineKirk/homebridge-InterrupteurCommande/blob/master/photos/photo2.jpg" width=150 align="right" />  

## But

Envoyer des commandes au module SR-201 dans le cadre d'une integration dans homebridge.
Ce module est équipé d'une connexion ethernet et de deux relais avec un port d'extension permettant d'en connecter 6 autres.  

## Remerciements
Un grand merci a Urs P. Stettler (https://github.com/cryxli) pour son travail.  
Total respect.  
Merci également à l'équipe homebrdige (https://homebridge.io). 

## Installation

1. Installez [homebridge](https://github.com/nfarina/homebridge#installation-details)  
2. Installez ce plugin: `npm install -g homebridge-InterrupteurSR201`  
3. Mettez à jour le fichier `config.json`  
4. Configurez le module SR-201  
4.1. Script perl (https://github.com/CapitaineKirk/homebridge-InterrupteurSR201/scripts/)  
4.2. Script python (https://github.com/cryxli/sr201/scripts/python-config-script/) 

## Configuration

```json
"accessories": [
     {
      "accessory": "InterrupteurSR201",
      "name": "Chauffe-eau",
      "adresseIp": "192.168.4.204",
      "relais": 1,
      "intervalLecture": 1,
      "debug": 0 
      }
]
```

| Key | Description | Default |
| --- | --- | --- |
| `accessory` | Doit être `InterrupteurSR201` | N/A |
| `name` | Nom qui apparaîtra dans l'application Home | N/A |
| `adresseIp` | Adresse Ip du module | N/A |
| `relais` | Numéro du relais | N/A |
| `intervalLecture` | Interval de lecture de l'état du module en seconde| 1 |
| `debug` | Active le mode verbeux | 0 |

## Protocole de commandes du SR-201
Ce n'est pas utile pour l'utilisation du plugin, mais permet de comprendre le fonctionnement de celui-ci.

Port de connexion TCP : 6722

Activation du relais 1  : 11   
relachement du relais 1 : 21  
Activation du relais 2  : 12  
relachement du relais 2 : 22  
Activation du relais 3  : 13  
relachement du relais 3 : 23  
Activation du relais 4  : 14  
relachement du relais 4 : 24  
Activation du relais 5  : 15  
relachement du relais 5 : 25  
Activation du relais 6  : 16  
relachement du relais 6 : 26  
Activation du relais 7  : 17  
relachement du relais 7 : 27  
Activation du relais 8  : 18  
relachement du relais 8 : 28  
Activation de tous les relais : 1X  
relachement de tous les relais : 2X  
Interrogation de l'etat des relais : 00  


Pour le fun, vous pouvez utiliser l'utilitaire nc pour dialoguer avec le module.  
Attention, pas de CR ni de CR/LF a la fin d'une commande (donc pas de touche \<return\>), mais envoi de la commande par CTRL-D (fin de flux).  


Remarque : le module vous deconnecte au bout de 15s sans activite.  


exemple :  
$ nc 192.168.0.200 6722  
00 (puis CTRL-D)  

renvoie:  
00000000  
si tous les relais sont relaches  



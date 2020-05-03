#homebridge-InterrupteurCommande

##But
envoyer des commandes au module SR-201 dans le cadre d'une integration dans homebridge
<img src="https://github.com/CapitaineKirk/homebridge-InterrupteurCommande/blob/master/photos/photo1.jpg" width=150 align="right" />
<img src="https://github.com/CapitaineKirk/homebridge-InterrupteurCommande/blob/master/photos/photo1.jpg" width=150 align="left" />
##Remerciements
Un grand merci a Urs P. Stettler (https://github.com/cryxli) pour son travail.
Total respect.

##Protocole de commandes du SR-201

Port de connexion : 6722

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

Pour le fun, vous pouvez utiliser l'utilitaire nc pour dialoguer avec le
module.
Attention, pas de CR ni de CR/LF a la fin d'une commande (donc pas de touche
<return>), mais envoi de la commande par CTRL-D (fin de flux).

Remarque : le module vous deconnecte au bout de 15s sans activite.

exemple :
$ nc 192.168.0.200 6722
00 (puis CTRL-D)

renvoie:
00000000
si tous les relais sont relaches


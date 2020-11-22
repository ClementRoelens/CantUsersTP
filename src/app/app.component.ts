import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';
import { User } from './interfaces';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  users: User[] = [];
  amountToTransmit: number = null;
  // Notre template affichera "En chargement" tant que ce booléen sera faux, via la directive ngIf
  dataReceived : boolean = false;
  numberToolTipId : number = 0;

  constructor(private dataService: DataService) { }

  ngOnInit() {
    // À l'initialisation, on va utiliser la fonction getAllUsers du DataService pour afficher notre tableau. Cependant on a besoin d'une autorisation
    // On va donc tester la présence du JWT et, s'il est absent, on va en créer un en utilisant la fonction login
    let token = sessionStorage.getItem("JWT");

    if (!token) {
      this.dataService.login().subscribe(res => {
        token = res.headers.get("Authorization");
        sessionStorage.setItem("JWT", token);
        this.getUsers();        
      });
    }
    else {
      this.getUsers(); 
    }
  }

  getUsers(){
    // Les utilisateurs renvoyés par la fonction vont être affectés à la variable this.users afin de faire du binding de lecture dans le template
    // On indique également que les données sont reçues au booléen dataReceived afin d'actualiser notre template
    this.dataService.getAllUsers().subscribe((res: User[]) => {
      this.users = res;
      this.dataReceived = true;
    });
  }

  edit(event:any, userId:number, operation:string) {
    // La vérification de l'input se fait au moment où amountToTransmit est affectée, dans la fonction getAmount() se déclenchant à la saisie
    // Ici, on vérifie donc que cette valeur n'est pas vide
    if (this.amountToTransmit) {
      this.dataService.editWallet(userId, operation, this.amountToTransmit).subscribe((res: User) => {
        // Une fois la requête envoyée et la réponse reçue, on modifie notre variable users et cela modifiera automatiquement le DOM
       
        // Mais d'abord, on affiche un petit message

        // Pendant cette animation de 3s, on empêche l'utilisateur de renvoyer des requêtes
        // TO DO
        // TO DO
        // Désactiver les boutons
        // TO DO
        // TO DO
        let message = document.createElement("div");
        let text = "La somme de "+this.amountToTransmit+"€ a bien été";
        text += (operation === "+") ? " ajoutée au " : " retirée du ";
        text += "porte-feuille de "+res.firstname+ " "+res.name+".";
        let textNode = document.createTextNode(text);
        message.append(textNode);
        // TO DO
        // TO DO
        // La position absolute n'est pas la bonne solution car en cas de redimensionnement de la fenêtre...
        // TO DO
        // TO DO
        message.style.position = "absolute";
        // On donne maintenant une position à toolTip, à côté du tableau
        message.style.top = event.target.getBoundingClientRect().top - 3 + "px";
        if (event.target.innerText === "+") {
          message.style.left = event.target.getBoundingClientRect().left + 70 + "px";
        }
        else {
          message.style.left = event.target.getBoundingClientRect().left + 40 + "px";
        }
        message.style.backgroundColor = "rgb(200, 200, 200)";
        message.style.fontSize = "0.9em";
        message.style.padding = "5px";

        // On va le faire apparaître en fondu en lui donnant une opacité à 0
        message.style.opacity = "0";
        message.style.transition = "opacity 1s"

        event.target.parentNode.append(message);

        setTimeout(() => { message.style.opacity = "1" }, 1);
        setTimeout(() => { message.style.opacity = "0"}, 2000);
        setTimeout(() => { 
          // On cherche l'index de l'utilisateur correspondant (grâce à la réponse du serveur) et on va l'utiliser pour modifier notre tableau d'utilisateurs
          let index = this.users.findIndex(user => user.id == userId);
          this.users[index] = res;
          // Cette modification entraîne un rerendu du DOM qui effacera automatiquement le message
        }, 3000);
      });
    }
    // Si la valeur est vide, c'est que l'utilisateur n'a pas saisi de nombre, et on lui indique
    else{
      // Mais seulement si ce message n'existe pas déjà^
      let tooltip = event.target.parentNode.lastElementChild;
      if (!tooltip.id.includes("tooltip")) {
        // On va afficher un message disant d'entrer un nombre en tooltip
        let toolTip = document.createElement("div");
        let text = document.createTextNode("Veuillez entrer un nombre")
        toolTip.append(text);
        toolTip.id = "tooltip" + this.numberToolTipId++;
        // TO DO
        // TO DO
        // La position absolute n'est pas la bonne solution car en cas de redimensionnement de la fenêtre...
        // TO DO
        // TO DO
        toolTip.style.position = "absolute";
        // On donne maintenant une position à toolTip, à côté du tableau
        toolTip.style.top = event.target.getBoundingClientRect().top - 3 + "px";
        if (event.target.innerText === "+") {
          toolTip.style.left = event.target.getBoundingClientRect().left + 70 + "px";
        }
        else {
          toolTip.style.left = event.target.getBoundingClientRect().left + 40 + "px";
        }
        toolTip.style.backgroundColor = "rgb(200, 200, 200)";
        toolTip.style.fontSize = "0.9em";
        toolTip.style.padding = "5px";

        // On va le faire apparaître en fondu en lui donnant une opacité à 0
        toolTip.style.opacity = "0";
        toolTip.style.transition = "opacity 1s"

        event.target.parentNode.append(toolTip);

        setTimeout(() => { toolTip.style.opacity = "1" }, 1);
      }
    }
  }

  getAmount(event:any) {
    // Cette fonction se déclenche à la saisie par le visiteur du montant à débiter/créditer
    // Elle affecte cette valeur à la variable amountToTransmit SEULEMENT si cette variable est un nombre
    let value = parseFloat(event.target.value);
    if (!isNaN(value)){
      this.amountToTransmit = event.target.value;
      // Si un tooltip avertissant d'entrer un nombre était présent, on le supprime
      let tooltip = event.target.parentNode.lastElementChild;
      // Si l'id de cet élément contient "tooltip", c'est bien le tooltip
      if (tooltip.id.includes("tooltip")){
        // Pour le faire disparaître progressivement
        setTimeout(() => { tooltip.style.opacity = "0" }, 1);
        setTimeout(() => {
          event.target.parentNode.removeChild(tooltip);
        }, 1000);
      }
    }
    // De plus, si la valeur n'est pas un nombre, elle réinitialise amountToTransmit à null, car il suffit d'un seul caracatère non-numérique pour provoquer un bug
    else{
      this.amountToTransmit = null;
    }
  }

}

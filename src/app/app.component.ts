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
  filteredUsers:User[] = [];
  amountToTransmit: number[] = [];
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
    // Les utilisateurs renvoyés par la fonction vont être affectés à la variable this.users, puis à filteredUsers afin de faire du binding de lecture dans le template
    // On indique également que les données sont reçues au booléen dataReceived afin d'actualiser notre template
    this.dataService.getAllUsers().subscribe((res: User[]) => {
      this.users = res;
      this.filteredUsers = this.users;
      this.dataReceived = true;
      this.users.forEach(user => {
        this.amountToTransmit.push(null);
      });
    });
  }

  edit(event:any, userId:number, operation:string, index:number) {
    // La vérification de l'input se fait au moment où amountToTransmit est affectée, dans la fonction getAmount() se déclenchant à la saisie
    // Ici, on vérifie donc que cette valeur n'est pas vide avant d'envoyer la requête
    if (this.amountToTransmit[index]) {
      // On cherche l'index de l'utilisateur correspondant (grâce à la réponse du serveur) et on va l'utiliser pour certaines opérations
      let unfilteredIndex = this.users.findIndex(user => user.id == userId);
      // On vérifie que, dans le cas où l'opération est un débit, la porte-feuille ne soit pas négatif (l'API renverrait une erreur de toute manière)
      if (((this.users[unfilteredIndex].wallet - this.amountToTransmit[index]) < 0) && (operation === "-")) {
        // Dans ce cas, on indique cette nécessité (bien entendu seulement si le message n'est pas déjà affiché)
        let tooltip = event.target.parentNode.parentNode.lastElementChild;
        if (tooltip.childNodes.length === 0){
          let textNode = document.createTextNode("Vous ne pouvez pas être à découvert, veuillez entrer un montant à débiter moins élevé");
          tooltip.append(textNode);
          setTimeout(() => { tooltip.style.opacity = "1" }, 1);
          setTimeout(() => { tooltip.style.opacity = "0" }, 2001);
          setTimeout(() => { tooltip.removeChild(tooltip.firstChild) }, 3001);
        }
        
      }
      else{
        this.dataService.editWallet(userId, operation, this.amountToTransmit[index]).subscribe((res: User) => {
          // Une fois la requête envoyée et la réponse reçue, on modifie notre variable users puis le filteredUser et cela modifiera automatiquement le DOM

          // Mais d'abord, on va désactiver les boutons car on va afficher un message dans une petite animation de 3 secondes
          let enfants = Array.from(event.target.parentNode.childNodes);
          enfants = enfants.filter((enfant: Node) => enfant.nodeName === "BUTTON");
          enfants.forEach((enfant: any) => { enfant.disabled = true });

          // Ensuite va afficher le message de validation dans l'élément créé à cet effet
          let tooltip = event.target.parentNode.parentNode.lastElementChild;
          let text = "La somme de " + this.amountToTransmit[index] + "€ a bien été";
          text += (operation === "+") ? " ajoutée au " : " retirée du ";
          text += "porte-feuille de " + res.firstname + " " + res.name + ".";
          let textNode = document.createTextNode(text);
          tooltip.append(textNode);

          setTimeout(() => { tooltip.style.opacity = "1" }, 1);
          setTimeout(() => { tooltip.style.opacity = "0" }, 2000);
          setTimeout(() => {

            this.users[unfilteredIndex] = res;
            // Pour rerendre le DOM et donc faire réapparaître les boutons, on réaffecte le filteredUser correspondant
            this.filteredUsers[index] = res;
            // On doit tout de même réinitialiser la variable amountToTransmit
            this.amountToTransmit[index] = null;
          }, 3000);
        });
      }
    }
    
    else{
      // Si la valeur est vide, c'est que l'utilisateur n'a pas saisi de nombre, et on lui indique
      // Mais seulement si ce message n'existe pas déjà
      let tooltip = event.target.parentNode.parentNode.lastElementChild;
      if (tooltip.childNodes.length === 0 ) {
        // On va afficher un message disant d'entrer un nombre en tooltip
        let textNode = document.createTextNode("Veuillez entrer un nombre");
        tooltip.append(textNode);
        setTimeout(() => { tooltip.style.opacity = "1" }, 1);
      }
    }
  }

  getAmount(event:any , index:number) {
    // Cette fonction se déclenche à la saisie par le visiteur du montant à débiter/créditer
    // Elle affecte cette valeur à la variable amountToTransmit SEULEMENT si cette variable est un nombre
    let value = parseFloat(event.target.value);
    if (!isNaN(value)){
      this.amountToTransmit[index] = event.target.value;
      // Si un tooltip avertissant d'entrer un nombre était présent, on le supprime
      let tooltip = event.target.parentNode.parentNode.lastElementChild;
      if (tooltip.childNodes.length>0){
        // Pour le faire disparaître progressivement
        setTimeout(() => { tooltip.style.opacity = "0" }, 1);
        setTimeout(() => { tooltip.removeChild(tooltip.firstChild) }, 1001);
      }
    }
    // De plus, si la valeur n'est pas un nombre, elle réinitialise amountToTransmit à null, car il suffit d'un seul caracatère non-numérique pour provoquer un bug
    else{
      this.amountToTransmit[index] = null;
    }
  }

  filter(event) {
    // À l'événement keyup, ce filtre est lancé pour que la variable filteredUser contienne tous les utilisateurs dont le nom ou le prénom contient la valeur entrée
    this.filteredUsers = this.users.filter(
      user => (user.firstname.toLowerCase().includes(event.target.value.toLowerCase()) || user.name.toLowerCase().includes(event.target.value.toLowerCase()) ));
  }
  
}

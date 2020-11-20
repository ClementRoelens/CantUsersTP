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
  

  constructor(private dataService: DataService) { }

  ngOnInit() {
    // À l'initialisation, on va utiliser la fonction getAllUsers du DataService pour afficher notre tableau. Cependant on a besoin d'une autorisation
    // On va donc tester la présence du JWT et, s'il est absent, on va en créer un en utilisant la fonction login
    let token = localStorage.getItem("JWT");

    if (!token) {
      this.dataService.login().subscribe(res => {
        token = res.headers.get("Authorization");
        localStorage.setItem("JWT", token);
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
        let index = this.users.findIndex(user => user.id == userId);
        this.users[index] = res;
      });
    }
    // Si la valeur est vide, c'est que l'utilisateur n'a pas saisi de nombre, et on lui indique
    else{
      // On va afficher un message disant d'entrer un nombre en tooltip
      let toolTip = document.createElement("div");
      let text = document.createTextNode("Veuillez entrer un nombre")
      toolTip.append(text);
      toolTip.style.position = "absolute";
      // On donne maintenant une position à toolTip, à côté du tableau
      toolTip.style.top = event.target.getBoundingClientRect().top-3+"px";
      if (event.target.innerText === "+"){
        console.log("getBoundmachin.left = "+event.target.getBoundingClientRect().left);
        toolTip.style.left = event.target.getBoundingClientRect().left+70+"px";
      }
      else{
        toolTip.style.left = event.target.getBoundingClientRect().left+40+"px";
      }
      toolTip.style.backgroundColor = "rgb(200, 200, 200)";
      toolTip.style.fontSize = "0.9em";
      toolTip.style.padding = "5px";

      // On va le faire apparaître en fondu en lui donnant une opacitéà 0 et le faire redisparaître ensuite de la même manière
      toolTip.style.opacity = "0";
      toolTip.style.transition = "opacity 1s"
      
      event.target.parentNode.append(toolTip);

      setTimeout(()=>{toolTip.style.opacity = "1"},1);
      setTimeout(()=>{toolTip.style.opacity = "0"},2000);
    }
  }

  getAmount(event:any) {
    // Cette fonction se déclenche à la saisie par le visiteur du montant à débiter/créditer
    // Elle affecte cette valeur à la variable amountToTransmit SEULEMENT si cette variable est un nombre
    let value = parseFloat(event.target.value);
    if (!isNaN(value)){
      this.amountToTransmit = event.target.value;
      console.log(parseFloat(event.target.value));
    }
    else{
      this.amountToTransmit = null;
    }
  }

}

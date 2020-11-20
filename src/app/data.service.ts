import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Credentials, User } from './interfaces';



const API: string = "http://localhost:8080/lunchtime";

@Injectable({
  providedIn: 'root'
})
export class DataService {

  credentials: Credentials = {
    email: "toto@gmail.com", password: "bonjour"
  };
  token: string | null = "";

  constructor(private http: HttpClient) { }

  login() {
    return this.http.post(API + "/login", this.credentials, { observe: "response" });
  }


  getAllUsers() { 
    let headers = {
      headers: { "Authorization": localStorage.getItem("JWT") }
    }

    return this.http.get(API + "/user/findall", headers);  
  }

  editWallet(user: Number, operation: string, amount: Number) {
    let options = {
      headers: { "Authorization": localStorage.getItem("JWT") }
    };

    let request;
    if (operation === "+") {
      request = this.http.post(API + "/user/credit/" + user + "?amount=" + amount, options, { headers: options.headers });
    }
    else {
      request = this.http.post(API + "/user/debit/" + user + "?amount=" + amount, options, { headers: options.headers });
    }
    return request;
  }

}

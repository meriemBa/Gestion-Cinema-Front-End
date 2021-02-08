import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {HttpClient} from '@angular/common/http';
import {CinemaService} from '../service/cinema.service';

@Component({
  selector: 'app-cinema',
  templateUrl: './cinema.component.html',
  styleUrls: ['./cinema.component.css']
})
export class CinemaComponent implements OnInit {
  imageSource;
  public villes;
  public cinemas;
  public currentVille;
  public currentCinema;
  public salles;
  public projections;
  public currentProjection;
  // @ts-ignore
  public selectedTickets: any[];
  constructor(public cinemaService:CinemaService,private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.cinemaService.getVilles()
      .subscribe(data=>{
        this.villes=data;
      },err=>{
        console.log(err);
      })
  }

  onGetCinema(v) {
    this.currentVille=v;
    this.salles=undefined;
    this.cinemaService.getCinemas(v)
      .subscribe(data=>{
        this.cinemas=data;
      },err=>{
        console.log(err);
      })
  }
  onGetSalles(c) {
    this.currentCinema=c;
    this.cinemaService.getSalles(c)
      .subscribe(data=>{
        this.salles=data;
        this.salles._embedded.salles.forEach(salle=>{
          this.cinemaService.getProjections(salle)
            .subscribe(data=>{
              salle.projections=data;
            },err=>{
              console.log(err);
            })
        })
      },err=>{
        console.log(err);
      })
  }

  onGetTicketsPlaces(p) {
    this.currentProjection = p;

    this.cinemaService.getTicketsPlaces(p)
      .subscribe(data => {
        this.currentProjection.tickets = data;

        this.selectedTickets=[];
      }, err => {
        console.log(err);
      })
  }

  onSelectTicket(t) {
    if(!t.selected){
      t.selected=true;
      this.selectedTickets.push(t);}
    else{
      t.selected=false;
      this.selectedTickets.splice(this.selectedTickets.indexOf(t),1);
    }
    console.log(this.selectedTickets);
  }
  getTicketClass(t: any) {
    let str="btn ticket ";
    if(t.reserve==true){
      str+="btn-danger";
    }
    else if(t.selected){
      str+="btn-warning"
    }
    else{
      str+="btn-success"
    }
    return str;
  }
  onPayTickets(dataform) {
    let tickets=[];
    this.selectedTickets.forEach(t=>{
      // @ts-ignore
      return tickets.push(t.id);
    });
    dataform.tickets=tickets;
    this.cinemaService.payerTickets(dataform)
      .subscribe(data=>{
        alert("tickets reservés avec succès!");
        this.onGetTicketsPlaces(this.currentProjection);
      },err=>{
        console.log(err);
      })
  }

  getImages(image:any){
    // console.log(image);
    this.imageSource = this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/png;base64, ${image}`);
    console.log(this.imageSource)
    return this.imageSource;
  }
}

import { Component, OnInit, Injectable} from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Title } from '@angular/platform-browser';
import {NgbDateStruct, NgbDatepickerI18n, NgbDatepickerConfig, NgbCalendar} from '@ng-bootstrap/ng-bootstrap';

import * as Model from '../../../models/Models';
import { ReservationService } from '../../../services/reservation/reservation.service';
import { ValidationService } from '../../../services/validation/validation.service';

const I18N_VALUES = {
  'es': {
    weekdays: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'],
    months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  }
};

@Injectable()
export class I18n {
  language = 'es';
}

@Injectable()
export class CustomDatepickerI18n extends NgbDatepickerI18n {

  constructor(private _i18n: I18n) {
    super();
  }

  getWeekdayShortName(weekday: number): string {
    return I18N_VALUES[this._i18n.language].weekdays[weekday - 1];
  }
  getMonthShortName(month: number): string {
    return I18N_VALUES[this._i18n.language].months[month - 1];
  }
  getMonthFullName(month: number): string {
    return this.getMonthShortName(month);
  }

  getDayAriaLabel(date: NgbDateStruct): string {
    return `${date.day}-${date.month}-${date.year}`;
  }
}

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css'],
  providers: [I18n, {provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n}]
})
export class ReservationComponent implements OnInit {

  model: NgbDateStruct;

  reservationForm: Model.IReservation = {
    deporte: 'Fútbol',
    fecha: '',
  };

  reservationSched: any = [];
  reservationHour: any = [];

  newReservation: Model.INewReservation = {
    fecha: '',
    valor_arriendo: null,
    rut_cliente: null,
    id_cancha: null,
    deporte_cancha: '',
    id_horario: null,
  }

  teamA: Model.ITeam = {
    nombre: '',
    nombre_representante: '',
    correo_representante: '',
    telefono: null,
  }

  teamB: Model.ITeam = {
    nombre: '',
    nombre_representante: '',
    correo_representante: '',
    telefono: null,
  }

  page = 1;
  pageSize = 5;
  collectionSize = 0;

  isShowTable = false;
  isShowForm = false;

  minDate = undefined;
  date = '';

  constructor(private reservationService: ReservationService, private validationService: ValidationService, private router: Router, private activatedRoute: ActivatedRoute, private title: Title, private flashMessage: FlashMessagesService, private modal: NgbModal, private calendar: NgbCalendar) {

    const current = new Date();
    this.minDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };

   }

  ngOnInit() {
    this.title.setTitle('Reserva');
    this.model = this.calendar.getToday();
  }

  PostReservation() {
    if(this.reservationForm.fecha == ''){
      this.reservationForm.fecha = this.minDate.year + '-' + this.minDate.month + '-' + this.minDate.day + ' ';
    }
    this.date = this.reservationForm.fecha;
    this.reservationService.Reservation(this.reservationForm).subscribe(
      res => {
        this.reservationSched = res;
        this.collectionSize = this.reservationSched.length;
      },
      err => console.error(err)
    )
  }

  onSelect(selectedItem: any) {
    this.newReservation = {
      fecha: this.reservationForm.fecha,
      valor_arriendo: selectedItem.precio,
      rut_cliente: parseInt(localStorage.rut),
      id_cancha: selectedItem.id,
      deporte_cancha: selectedItem.deporte,
      id_horario: selectedItem.id_horario,
    }
    this.reservationHour = {
      hora_inicio: selectedItem.hora_inicio,
      hora_termino: selectedItem.hora_termino
    }
  }

  get reservations() {
    return this.reservationSched
    .map((reservation: any, i: any) => ({id: i + 1, ...reservation}))
    .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
  }

  tableDisplay() {
    this.isShowTable = true;
  }

  formDisplay() {
    this.isShowForm = !this.isShowForm;

    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }

  PostNewReservation() {
    this.reservationService.newReservation(this.newReservation, this.teamA, this.teamB).subscribe(
      res => {
        console.log(res)
      },
      err => console.error(err)
    )
  }

  reload() {
    this.formDisplay();
  }

  openModal(content: any) {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    
    //Campos requeridos
    if(!this.validationService.validateTeam(this.teamA)){
      this.flashMessage.show('Completa todos los campos', {cssClass: 'alert-danger', timeout: 3000});
      return false;
    }
    if(!this.validationService.validateTeam(this.teamB)){
      this.flashMessage.show('Completa todos los campos', {cssClass: 'alert-danger', timeout: 3000});
      return false;
    }

    //Validacion email
    if(!this.validationService.validateEmail(this.teamA.correo_representante)){
      this.flashMessage.show('Ingresa un correo valido', {cssClass: 'alert-danger', timeout: 3000});
      return false;
    }
    if(!this.validationService.validateEmail(this.teamB.correo_representante)){
      this.flashMessage.show('Ingresa un correo valido', {cssClass: 'alert-danger', timeout: 3000});
      return false;
    }

    //Validacion telefono (8 digitos)
    if(!this.validationService.validateTel(this.teamA.telefono)){
      this.flashMessage.show('Ingresa un telefono valido', {cssClass: 'alert-danger', timeout: 3000});
      return false;
    }
    if(!this.validationService.validateTel(this.teamB.telefono)){
      this.flashMessage.show('Ingresa un telefono valido', {cssClass: 'alert-danger', timeout: 3000});
      return false;
    }

    this.modal.open(content);
  }

  selectDate(date: any){
    this.reservationForm.fecha = date.year + '-' + date.month + '-' + date.day + ' ';
  }
}

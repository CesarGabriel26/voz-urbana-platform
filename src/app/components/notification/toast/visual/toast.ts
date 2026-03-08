import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Notification } from '../../notification';

@Component({
  selector: "m-toast",
  templateUrl: "./toast.html",
  styleUrl: "./toast.scss",
})
export class ToastComponent {

  @Input() toast!: Notification;

  @Output() close = new EventEmitter<void>();

}
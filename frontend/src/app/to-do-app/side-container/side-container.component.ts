import { Component, OnInit, Input, ViewChild, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
import * as jQuery from 'jquery';

declare var $: any;
window['$'] = jQuery;

@Component({
  selector: 'app-side-container',
  templateUrl: './side-container.component.html',
  styleUrls: ['./side-container.component.scss']
})
export class SideContainerComponent implements OnInit {
  @Input() container_width: string;
  @Input() unique_id: string = '';
  @Output() side_div_events = new EventEmitter();
  @Input() container_title = '';

  constructor(private _elementRef: ElementRef) {
  }

  ngOnInit() {
  }

  openContainer() {
    $('.sideDiv').css('border-left', '5px solid #8acfd1');
    $('.sideDiv').css('border-top', '5px solid #8acfd1');
    $('#sideContainer'+this.unique_id).width(this.container_width);
    // $('#main').css('background-color', 'rgba(0,0,0,0.4)');
  }

  closeContainer() {
    $('.sideDiv').css('border', '0');
    $('#sideContainer'+this.unique_id).width('0');
    // $('#main').css('background-color', 'white');
  }

}

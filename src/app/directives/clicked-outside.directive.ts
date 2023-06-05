import { DirectiveAst } from '@angular/compiler';
import {Directive, ElementRef, Output, EventEmitter, HostListener, Inject, AfterViewInit, OnDestroy} from '@angular/core';

@Directive({
  selector: '[appClickedOutside]'
})

export class ClickedOutsideDirective {

  constructor(private elementRef: ElementRef) { }

  @Output() public clickedOutside = new EventEmitter();

  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement: any) {
    // if (!targetElement) {
    //   console.log("Here 1")
    //   return;
    // }
    if (targetElement.name == "addTask") {
      return;
    }
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    //console.log("Here 2")
    if (!clickedInside) {
      //console.log("Here 3")
      this.clickedOutside.emit(true);
      
    }
  }
}

// .................................................................................

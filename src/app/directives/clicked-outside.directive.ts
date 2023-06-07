import {Directive, ElementRef, Output, EventEmitter, HostListener, Input} from '@angular/core';

@Directive({
  selector: '[appClickedOutside]'
})

export class ClickedOutsideDirective {

  constructor(private elementRef: ElementRef) { }

  @Output() public clickedOutside = new EventEmitter();
  // @Input() set appClickedOutside(inFocus) {
  //   console.log("INSIDE INPUT")
  //   if (!inFocus) {
  //     return;
  //   }
  // }

  @HostListener('document:click', ['$event.target', '$event.target.id'])
  public onClick(targetElement: any, id:string) {
    // if (!targetElement) {
    //   console.log("Here 1")
    //   return;
    // }
    // let target = document.getElementById(id)
    // if (targetElement.name == "rows") {
    //   const clickedInside = this.elementRef.nativeElement.contains(target);
    //   if (!clickedInside) {
    //     this.clickedOutside.emit(true);
    //   }
    // }
    if (targetElement.name == "addTask" || targetElement.name == "addNewComment") {
      return;
    }
    // if (id == "existingTask") {
    //console.log("id: " + id)
    // }
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.clickedOutside.emit(true);
    }
  }
}

// .................................................................................

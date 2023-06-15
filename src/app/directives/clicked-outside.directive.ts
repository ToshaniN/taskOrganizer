import {Directive, ElementRef, Output, EventEmitter, HostListener, Input} from '@angular/core';

@Directive({
  selector: '[appClickedOutside]'
})

export class ClickedOutsideDirective {

  insideRow = false
  constructor(private elementRef: ElementRef) { }

  @Output() public clickedOutside = new EventEmitter();
  // @Input() set appClickedOutside(inFocus) {
  //   console.log("INSIDE INPUT")
  //   if (!inFocus) {
  //     return;
  //   }
  // }

  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement: any) {
    // let target = document.getElementById(id)
    // if (targetElement.name == "rows") {
    //   const clickedInside = this.elementRef.nativeElement.contains(target);
    //   if (!clickedInside) {
    //     this.clickedOutside.emit(true);
    //   }
    // }
    //console.log("id: " + id) //empty unless <td> element
    if (targetElement.name == "addTask" || targetElement.name == "addNewComment") {
      return;
    }
    const clickedInside = this.elementRef.nativeElement.contains(targetElement); // true if <td> element in current row is clicked, flase otherwise
    if (clickedInside) { //if something inside the row in focus was clicked, the flag is true
      console.log("click occurred inside the row")
      this.insideRow = true
    } else if (!clickedInside && this.insideRow) {  // click occurred outside the row, and since insideRow was true, it means the row's input element lost focus
      this.clickedOutside.emit(true);              //  event will only be emmited if an input textbox was once in focus in the row, and now a click has occurred outside 
      this.insideRow = false
    }
  }
}

// .................................................................................

import { Component, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ConceptNode {
  title: string;
  x: number;
  y: number;
  color?: string;
  children?: ConceptNode[];
}

@Component({
  selector: 'app-concept-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './concept-map.component.html',
  styleUrls: ['./concept-map.component.scss'],
})
export class ConceptMapComponent implements AfterViewInit {
  @ViewChild('editInput') editInput!: ElementRef;

  colorOptions = [
    { name: 'Green', value: '#4caf50' },
    { name: 'Blue', value: '#2196f3' },
    { name: 'Red', value: '#f44336' },
    { name: 'Orange', value: '#ff9800' },
    { name: 'Purple', value: '#9c27b0' },
    { name: 'Teal', value: '#009688' },
    { name: 'Pink', value: '#e91e63' },
    { name: 'Indigo', value: '#3f51b5' }
  ];

  selectedColor = '#4caf50';
  colorMode = false;

  nodes = [
    {
      title: 'Angular',
      x: 400,
      y: 200,
      color: '#4caf50',
      children: [
        { title: 'Basic Concepts', x: 200, y: 100, color: '#e8f5e8' },
        { title: 'Core Concepts', x: 600, y: 100, color: '#e8f5e8' }
      ]
    }
  ];

  draggingNode: any = null;
  offsetX = 0;
  offsetY = 0;
  selectedChild: any = null;
  editingNode: any = null;
  originalTitle = '';

  ngAfterViewInit() {
    // Focus input after view init if editing
    if (this.editInput) {
      setTimeout(() => {
        this.editInput.nativeElement.focus();
        this.editInput.nativeElement.select();
      });
    }
  }

  onMouseDown(event: MouseEvent, node: any) {
    // Don't start dragging if we're editing
    if (this.editingNode) return;
    
    this.draggingNode = node;
    this.offsetX = event.offsetX;
    this.offsetY = event.offsetY;
    event.stopPropagation();
  }

  onMouseMove(event: MouseEvent) {
    if (this.draggingNode && !this.editingNode) {
      this.draggingNode.x = event.clientX - this.offsetX;
      this.draggingNode.y = event.clientY - this.offsetY;
    }
  }

  onMouseUp() {
    this.draggingNode = null;
  }

  generatePath(source: any, target: any): string {
    const startX = source.x + 50;
    const startY = source.y + 25;
    const endX = target.x + 50;
    const endY = target.y + 25;
    const deltaX = (endX - startX) / 2;

    return `M${startX},${startY} C${startX + deltaX},${startY} ${endX - deltaX},${endY} ${endX},${endY}`;
  }

  /** Show context menu on single click */
  onChildClick(event: MouseEvent, child: any) {
    // Don't show context menu if we're editing
    if (this.editingNode) return;
    
    // Apply color if in color mode
    if (this.colorMode) {
      this.applyColorToNode(child, event);
      return;
    }
    
    event.stopPropagation();
    this.selectedChild = child;
  }

  /** Hide context menu */
  clearContextMenu() {
    this.selectedChild = null;
  }

  /** Duplicate child node */
  duplicateChild(child: any, event: MouseEvent) {
    event.stopPropagation();
    const parent = this.nodes[0];

    const newChild = {
      title: `${child.title} Copy`,
      x: child.x + 20,
      y: child.y + 20,
      color: child.color || '#e8f5e8'
    };

    parent.children.push(newChild);
    this.selectedChild = null;
  }

  /** Start editing a node on double click */
  startEditing(node: any) {
    this.editingNode = node;
    this.originalTitle = node.title;
    this.selectedChild = null; // Hide context menu when editing
    
    // Focus and select text after a short delay
    setTimeout(() => {
      const input = document.querySelector('.edit-input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 0);
  }

  /** Stop editing and save changes */
  stopEditing() {
    this.editingNode = null;
    this.originalTitle = '';
  }

  /** Cancel editing and restore original title */
  cancelEditing() {
    if (this.editingNode && this.originalTitle) {
      this.editingNode.title = this.originalTitle;
    }
    this.editingNode = null;
    this.originalTitle = '';
  }

  /** Prevent drag when double-clicking */
  @HostListener('document:dblclick', ['$event'])
  onDoubleClick(event: Event) {
    event.preventDefault();
  }

  /** Select color from palette */
  selectColor(color: string) {
    this.selectedColor = color;
    this.colorMode = true;
    this.selectedChild = null; // Hide context menu
  }

  /** Handle custom color picker change */
  onColorChange() {
    this.colorMode = true;
    this.selectedChild = null;
  }

  /** Apply selected color to a node */
  applyColorToNode(node: any, event: MouseEvent) {
    if (this.colorMode) {
      event.stopPropagation();
      node.color = this.selectedColor;
      this.colorMode = false; // Exit color mode after applying
    }
  }
}
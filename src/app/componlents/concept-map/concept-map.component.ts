import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Node {
  id: number;
  title: string;
  x: number;
  y: number;
  editing?: boolean;
  color?: string;
  children: Node[];
}

interface SavedLayout {
  name: string;
  timestamp: number;
  nodes: Node[];
}

@Component({
selector: 'app-concept-map',
  templateUrl: './concept-map.component.html',
  styleUrls: ['./concept-map.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class ConceptMapComponent implements OnInit {
  nodes: Node[] = [
    {
      id: 1,
      title: 'Main Concept',
      x: 400,
      y: 200,
      color: '#667eea',
      children: [
        { id: 2, title: 'Idea 1', x: 200, y: 350, color: '#f093fb', children: [] },
        { id: 3, title: 'Idea 2', x: 600, y: 350, color: '#4facfe', children: [] }
      ]
    }
  ];

  presetColors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
    '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd',
    '#00d2d3', '#ff9f43', '#a55eea', '#26de81'
  ];

  selectedNode: Node | null = null;
  selectedColorNode: Node | null = null;
  offsetX = 0;
  offsetY = 0;
  selectedColor = '#ff6b6b';
  customColor = '#ff6b6b';
  nodeWidth = 120;
  nodeHeight = 50;
  nextNodeId = 4;
  containerWidth = 0;
  containerHeight = 0;

  // Save/Load functionality
  showSavePanel = false;
  showLoadPanel = false;
  saveLayoutName = '';
  savedLayouts: SavedLayout[] = [];

  ngOnInit() {
    this.loadSavedLayouts();
  }

  selectColor(color: string): void {
    this.selectedColor = color;
    if (this.selectedColorNode) {
      this.applyColorToNode(this.selectedColorNode);
    }
  }

  selectNodeForColoring(node: Node): void {
    this.selectedColorNode = node;
  }

  applyColorToNode(node: Node): void {
    node.color = this.selectedColor;
  }

  getNodeGradient(color: string): string {
    const lighterColor = this.lightenColor(color, 20);
    return `linear-gradient(135deg, ${color}, ${lighterColor})`;
  }

  lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  onMouseDown(event: MouseEvent, node: Node): void {
    event.preventDefault();
    this.selectedNode = node;
    this.offsetX = event.clientX - node.x;
    this.offsetY = event.clientY - node.y;
  }

  onMouseMove(event: MouseEvent): void {
    if (this.selectedNode) {
      this.updateContainerSize();
      
      let newX = event.clientX - this.offsetX;
      let newY = event.clientY - this.offsetY;
      
      newX = Math.max(10, Math.min(newX, this.containerWidth - this.nodeWidth - 10));
      newY = Math.max(100, Math.min(newY, this.containerHeight - this.nodeHeight - 10));
      
      this.selectedNode.x = newX;
      this.selectedNode.y = newY;
    }
  }

  updateContainerSize(): void {
    this.containerWidth = window.innerWidth;
    this.containerHeight = window.innerHeight;
  }

  rearrangeNodes(): void {
    this.updateContainerSize();
    
    this.nodes[0].x = this.containerWidth / 2 - this.nodeWidth / 2;
    this.nodes[0].y = 150;
    
    const children = this.nodes[0].children;
    const centerX = this.containerWidth / 2;
    const centerY = this.containerHeight / 2;
    const radius = Math.min(this.containerWidth, this.containerHeight) / 4;
    
    children.forEach((child, index) => {
      const angle = (index * 2 * Math.PI) / children.length;
      child.x = centerX + radius * Math.cos(angle) - this.nodeWidth / 2;
      child.y = centerY + radius * Math.sin(angle) - this.nodeHeight / 2;
      
      child.x = Math.max(10, Math.min(child.x, this.containerWidth - this.nodeWidth - 10));
      child.y = Math.max(100, Math.min(child.y, this.containerHeight - this.nodeHeight - 10));
    });
    
    this.selectedColorNode = null;
  }

  onMouseUp(): void {
    this.selectedNode = null;
  }

  onNodeDoubleClick(node: Node): void {
    node.editing = true;
  }

  addNewNode(): void {
    this.updateContainerSize();
    
    const newNode: Node = {
      id: this.nextNodeId++,
      title: 'New Node',
      x: Math.max(10, Math.min(Math.random() * (this.containerWidth - this.nodeWidth - 20), this.containerWidth - this.nodeWidth - 10)),
      y: Math.max(100, Math.min(Math.random() * (this.containerHeight - this.nodeHeight - 120), this.containerHeight - this.nodeHeight - 10)),
      color: this.selectedColor,
      children: []
    };
    this.nodes[0].children.push(newNode);
  }

  generatePath(from: Node, to: Node): string {
    const startX = from.x + this.nodeWidth / 2;
    const startY = from.y + this.nodeHeight / 2;
    const endX = to.x + this.nodeWidth / 2;
    const endY = to.y + this.nodeHeight / 2;
    const dx = (endX - startX) / 2;
    const dy = (endY - startY) / 4;

    return `M${startX},${startY} C${startX + dx},${startY + dy} ${endX - dx},${endY - dy} ${endX},${endY}`;
  }

  // Save/Load functionality
  saveLayout(): void {
    if (!this.saveLayoutName.trim()) {
      alert('Please enter a layout name');
      return;
    }

    const layout: SavedLayout = {
      name: this.saveLayoutName.trim(),
      timestamp: Date.now(),
      nodes: JSON.parse(JSON.stringify(this.nodes)) // Deep copy
    };

    this.savedLayouts.push(layout);
    this.updateLocalStorage();
    
    this.saveLayoutName = '';
    this.showSavePanel = false;
    
    // Show success message
    this.showSuccessMessage('Layout saved successfully!');
  }

  loadLayout(layout: SavedLayout): void {
    this.nodes = JSON.parse(JSON.stringify(layout.nodes)); // Deep copy
    this.showLoadPanel = false;
    this.selectedColorNode = null;
    
    // Update nextNodeId to avoid conflicts
    this.updateNextNodeId();
    
    this.showSuccessMessage('Layout loaded successfully!');
  }

  deleteLayout(layout: SavedLayout): void {
    if (confirm(`Are you sure you want to delete "${layout.name}"?`)) {
      this.savedLayouts = this.savedLayouts.filter(l => l !== layout);
      this.updateLocalStorage();
    }
  }

  loadSavedLayouts(): void {
    const saved = localStorage.getItem('conceptMapLayouts');
    if (saved) {
      try {
        this.savedLayouts = JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved layouts:', e);
        this.savedLayouts = [];
      }
    }
  }

  updateLocalStorage(): void {
    localStorage.setItem('conceptMapLayouts', JSON.stringify(this.savedLayouts));
  }

  updateNextNodeId(): void {
    let maxId = 0;
    const findMaxId = (nodes: Node[]) => {
      nodes.forEach(node => {
        if (node.id > maxId) maxId = node.id;
        findMaxId(node.children);
      });
    };
    findMaxId(this.nodes);
    this.nextNodeId = maxId + 1;
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }

  showSuccessMessage(message: string): void {
    // Create a temporary success notification
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #26de81, #20bf6b);
      color: white;
      padding: 12px 24px;
      border-radius: 25px;
      box-shadow: 0 8px 25px rgba(38, 222, 129, 0.3);
      z-index: 3000;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  }

  @HostListener('document:keydown.enter', ['$event'])
  finishEditing(): void {
    this.nodes.forEach(node => {
      if (node.editing) node.editing = false;
      node.children.forEach(child => {
        if (child.editing) child.editing = false;
      });
    });
  }

  @HostListener('document:keydown.escape', ['$event'])
  closePanels(): void {
    this.showSavePanel = false;
    this.showLoadPanel = false;
  }
}
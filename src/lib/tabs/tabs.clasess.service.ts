import { Injectable } from '@angular/core';
import { LyTheme2 } from '@alyle/ui';

@Injectable({
  providedIn: 'root'
})
export class LyTabsClassesService {
  tabs = this.theme.setUpStyle(
    'k-tabs',
    () => (
      `display:block;` +
      `overflow:hidden;`
    )
  );
  tabsLabels = this.theme.setUpStyle(
    'k-tab-labels',
    () => (
      `display: flex;` +
      `position: relative;` +
      `flex-grow: 1;` +
      `overflow: hidden;`
    )
  );
  tab = this.theme.setUpStyle(
    'k-tab',
    () => (
      `display: inline-flex;`
    )
  );
  tabLabel = this.theme.setUpStyle(
    'k-tab-label',
    () => (
      `min-width: 160px;` +
      `padding: 0 24px;` +
      `cursor: pointer;` +
      `height: 48px;` +
      `display: inline-flex;` +
      `justify-content: center;` +
      `align-items: center;`
    )
  );
  tabContents = this.theme.setUpStyle(
    'k-tab-contents',
    () => (
      `display: flex;` +
      `will-change: transform;`
    )
  );
  tabContent = this.theme.setUpStyle(
    'k-tab-content',
    () => (
      `width: 100%;` +
      `flex-shrink: 0;` +
      `position: relative;` +
      `cursor: pointer;` +
      `height: 48px;`
    )
  );
  tabsIndicator = this.theme.setUpStyle(
    'k-tabs-indicator',
    () => (
      `flex-shrink: 0;` +
      `position: absolute;` +
      `bottom: 0;` +
      `height: 2px;` +
      `left: 0;`
    )
  );
  constructor(
    private theme: LyTheme2
  ) { }
}
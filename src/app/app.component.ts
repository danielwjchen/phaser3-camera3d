import * as Phaser from 'phaser';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { MainScene } from 'src/game/scene';

import {
  PLUGIN_PLATFORMER, PlatformerPlugin
} from 'src/plugins/platformer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnDestroy {

  private game: Phaser.Game | undefined;

  @ViewChild('canvasContainer')
  public canvasContainer: ElementRef | undefined;

  ngAfterViewInit() {
    if (typeof this.canvasContainer === 'undefined') {
      return;
    }
    let gameConfig: Phaser.Types.Core.GameConfig = {
      parent: this.canvasContainer.nativeElement,
      type: Phaser.AUTO,
      width: 1280,
      height: 720,
      backgroundColor: '#18216D',
      scene: new MainScene(),
      plugins: {
          scene: [
            { 
              key: PLUGIN_PLATFORMER, 
              plugin: PlatformerPlugin, 
              mapping: 'platformer',
            }
          ]
      },
    };

    this.game = new Phaser.Game(gameConfig);

  }

  ngOnDestroy() {
    if (this.game !== undefined) {
      this.game.destroy(true);
    }
  }

}

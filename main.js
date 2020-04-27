// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import "@babel/polyfill";
import * as mobilenetModule from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import { div } from "@tensorflow/tfjs";
import {Howl, Howler} from 'howler';

// Number of classes to classify
const NUM_CLASSES = 2
const CLASS_NAMES = ['Straight', 'Slouched']
// Webcam Image size. Must be 227. 
const IMAGE_SIZE = 227;
// K value for KNN
const TOPK = 10;


class Main {
  constructor() {
    // Initiate variables
    this.infoTexts = [];
    this.timerText = [];
    this.slouchScores = [100, 0];
    this.training = -1; // -1 when no class is being trained
    this.timeCheck = -1;  // -1 when not clicked
    this.videoPlaying = false;
    this.sound = new Howl({
      src: ['./nein.mp3'],
      volume: 0.5,
    })  // creates sound var

    // Initiate deeplearn.js math and knn classifier objects
    this.bindPage();

    // Make header
    const title = document.createElement('header')
    title.innerText = "Hey there sloucher!";
    title.style.marginTop = '20px';
    title.style.textAlign = 'center';
    document.body.appendChild(title);

    // common div for centering
    const bodyDiv = document.createElement('div')
    bodyDiv.style.textAlign = 'center';
    document.body.appendChild(bodyDiv);


    // Create video element that will contain the webcam image
    this.video = document.createElement('video');
    this.video.setAttribute('autoplay', '');
    this.video.setAttribute('playsinline', '');

    // Add video element to DOM
    bodyDiv.appendChild(this.video);

    // Create training buttons and info texts    
    for (let i = 0; i < NUM_CLASSES; i++) {
      const div = document.createElement('div');
      bodyDiv.appendChild(div);
      div.style.marginBottom = '10px';

      // Create training button
      const button = document.createElement('button')
      button.innerText = CLASS_NAMES[i];
      div.appendChild(button);
      // button.style.width='100px';
      // button.style.backgroundColor = 'white';
      // button.style.borderWidth = '1px';
      // button.style.borderColor = 'gray';

      // Listen for mouse events when clicking the button
      button.addEventListener('mousedown', () => this.training = i);
      button.addEventListener('mouseup', () => this.training = -1);

      // Create info text
      const infoText = document.createElement('span')
      infoText.innerText = " Add examples";
      div.appendChild(infoText);
      this.infoTexts.push(infoText);
    }

    // Add timer buton
    const timerDiv = document.createElement('div')
    bodyDiv.appendChild(timerDiv);
    timerDiv.style.marginBottom = '10px';

    const timerBtn = document.createElement('button')
    timerBtn.innerText = 'Start me';
    timerDiv.appendChild(timerBtn);
    // timerBtn.style.width='100px';
    timerBtn.style.backgroundColor = 'red';
    // timerBtn.style.color = 'white';
    // timerBtn.style.borderWidth = '1px';
    // timerBtn.style.borderColor = 'red';

    // Listen for click to start timer
    timerBtn.addEventListener('click', () => this.timeCheck *= -1);

    const timeSpan = document.createElement('span')
    timeSpan.innerText = "";
    timerDiv.appendChild(timeSpan);
    this.timerText.push(timeSpan);

    bodyDiv.appendChild(timerDiv);

    // Setup webcam
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        this.video.srcObject = stream;
        this.video.width = IMAGE_SIZE;
        this.video.height = IMAGE_SIZE;

        this.video.addEventListener('playing', () => this.videoPlaying = true);
        this.video.addEventListener('paused', () => this.videoPlaying = false);
      })
  }

  async bindPage() {
    this.knn = knnClassifier.create();
    this.mobilenet = await mobilenetModule.load();

    this.start();
  }

  start() {
    if (this.timer) {
      this.stop();
    }
    this.video.play();
    this.timer = requestAnimationFrame(this.animate.bind(this));
  }

  stop() {
    this.video.pause();
    cancelAnimationFrame(this.timer);
  }

  async animate() {
    if (this.videoPlaying) {
      // Get image data from video element
      const image = tf.fromPixels(this.video);

      let logits;
      // 'conv_preds' is the logits activation of MobileNet.
      const infer = () => this.mobilenet.infer(image, 'conv_preds');

      // Train class if one of the buttons is held down
      if (this.training != -1) {
        logits = infer();

        // Add current image to classifier
        this.knn.addExample(logits, this.training)
      }

      const numClasses = this.knn.getNumClasses();
      if (numClasses > 0) {

        // If classes have been added run predict
        logits = infer();
        const res = await this.knn.predictClass(logits, TOPK);

        for (let i = 0; i < NUM_CLASSES; i++) {

          // The number of examples for each class
          const exampleCount = this.knn.getClassExampleCount();

          // Make the predicted class bold
          if (res.classIndex == i) {
            this.infoTexts[i].style.fontWeight = 'bold';
          } else {
            this.infoTexts[i].style.fontWeight = 'normal';
          }

          // Update info text
          if (exampleCount[i] > 0) {
            this.infoTexts[i].innerText = ` ${exampleCount[i]} examples - ${res.confidences[i] * 100}%`
            if (this.timeCheck != -1) {
              this.slouchScores[i] += res.confidences[i]  // keep track of slouch score
              // Couldn't make it work anywhere else
              const slouchScore = (this.slouchScores[0] - this.slouchScores[1])
              if (slouchScore > 100) {this.slouchScores = [100, 0]}  // resets slouch score
              if (slouchScore < 0) {this.slouchScores = [0, 0]}  // resets slouch score
              if (slouchScore < 10) {
                var newSound = this.sound.play()                           
              }
              this.timerText[0].innerText = `Score: ${parseInt(slouchScore, 10)}`
            }            
          }
        }
      }

      // Dispose image when done
      image.dispose();
      if (logits != null) {
        logits.dispose();
      }
    }
    this.timer = requestAnimationFrame(this.animate.bind(this));
  }
}

window.addEventListener('load', () => new Main());
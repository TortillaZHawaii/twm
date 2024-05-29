import DiceColor from './dice_color.js';

export default class Dice {
    constructor(color, value) {
        if (!Object.values(DiceColor).includes(color)) {
            throw new Error('color must be an instance of DiceColor');
        }
        this.color = color;
        if (value !== undefined && (value < 1 || value > 6)) { 
            throw new Error('value must be between 1 and 6');
        }
        this.value = value;
    }

    nextValue() {
        this.value = this.value + 1 > 6 ? 1 : this.value + 1;
    }

    previousValue() {
        this.value = this.value - 1 < 1 ? 6 : this.value - 1;
    }

    nextColor() {
        const colors = Object.values(DiceColor);
        const currentIndex = colors.indexOf(this.color);
        const nextIndex = currentIndex + 1 >= colors.length ? 0 : currentIndex + 1;
        this.color = colors[nextIndex];
    }

    previousColor() {
        const colors = Object.values(DiceColor);
        const currentIndex = colors.indexOf(this.color);
        const previousIndex = currentIndex - 1 < 0 ? colors.length - 1 : currentIndex - 1;
        this.color = colors[previousIndex];
    }
}

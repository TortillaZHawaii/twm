export class Rule {
    constructor(title, description) {
      if (title === undefined || description === undefined) {
        throw new Error("Both title and description are required");
      }
      this.title = title;
      this.description = description;
    }
  
    calculateScore(board) {
      throw new Error("calculateScore must be implemented by subclass");
    }
}

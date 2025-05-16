import { Row } from "src/db";

export class Category extends Row {
  public name: string = '';
}

export class Note extends Row {
  public title: string = '';
  public content: string = '';
  public categories: number [] = [];
  public priority: number = 3
}


const initializeData = () => {
  // Only create data if no categories or notes exist
  if (Category.all().length === 0 && Note.all().length === 0) {
    // Create categories
    Category.create({ name: 'Work' });
    Category.create({ name: 'Personal' });
    Category.create({ name: 'Shopping' });

    // Create notes
    Note.create({
      title: 'Work Note 1',
      content: 'This is a note related to work.',
      categories: [],
    });

    Note.create({
      title: 'Personal Note 1',
      content: 'This is a note related to personal matters.',
      categories: [],
      priority: 4,
    });

    Note.create({
      title: 'Shopping List',
      content: 'This is a shopping list note.',
      categories: [],
      priority: 2,
    });

    console.log('Example data created.');
  } else {
    console.log('Data already exists, skipping creation.');
  }
};

// Initialize example data
initializeData();
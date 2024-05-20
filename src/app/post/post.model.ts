export interface Post {
  _id: string;
  title: string;
  content: string;
  imagePath: string;
  author: string; // Add this line
  timePosted: Date; // Add this line
}
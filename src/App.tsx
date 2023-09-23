import "./styles.css";
import { Book, BookInformation } from "./lib/types";
import { getBooks, getUsers, getReviews } from "./lib/api";
import { useEffect, useState, FC } from "react";
import Card from "./Card";
import { reviews } from "./lib/mocks";

// Техническое задание:
// Доработать приложение App, чтобы в отрисованном списке
// были реальные отзывы, автор книги и автор отзыва.
// Данные об отзывах и пользователях можно получить при помощи асинхронных
// функций getUsers, getReviews

// функция getBooks возвращает Promise<Book[]>
// функция getUsers возвращает Promise<User[]>
// функция getReviews возвращает Promise<Review[]>

// В объектах реализующих интерфейс Book указаны только uuid
// пользователей и обзоров

// // В объектах реализующих интерфейс BookInformation, ReviewInformation
// указана полная информация об пользователе и обзоре.

const toBookInformation = (
  book: Book,
  userMap: Map<string, string>,
  reviewsMap: Map<string, { userId: string; text: string }>
): BookInformation => {
  const authorName = userMap.get(book.authorId) || "Unknown Author";
  book.reviewIds.map((item) => {
    console.log(reviewsMap.has(item));
  });
  return {
    id: book.id,
    name: book.name || "Книга без названия",
    author: { name: authorName, id: book.authorId },
    reviews: [
      ...book.reviewIds.map((item) => {
        let testUser = {
          id: "test",
          text: "test text",
          user: { id: "sdf", name: "Reviewer" },
        };
        let userId = reviewsMap.get(item)?.userId;
        let userReview =
          reviewsMap.get(item) && userId
            ? { id: userId, name: userMap.get(userId) || "" }
            : testUser.user;

        return reviewsMap.has(item)
          ? {
              id: item,
              user: userReview,
              text: reviewsMap.get(item)?.text || "",
            }
          : testUser;
      }),
    ],
    description: book.description,
  };
};
const toBook = (bookInfo: Book): Book => ({
  id: bookInfo.id,
  name: bookInfo.name,
  authorId: bookInfo.authorId,
  reviewIds: bookInfo.reviewIds.map((review) => review),
  description: bookInfo.description,
});

const App: FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userMap, setUserMap] = useState<Map<string, string>>(new Map());
  const [reviews, setReviewsMap] = useState<
    Map<string, { userId: string; text: string }>
  >(new Map());

  useEffect(() => {
    //массив книг
    const fetchBooks = async () => {
      setIsLoading(true);
      const fetchedBookInfos = await getBooks();
      const convertedBooks = fetchedBookInfos.map(toBook);
      setBooks(convertedBooks);
      setIsLoading(false);
    };
    //массив пользователей
    const fetchUserMap = async () => {
      const data = await getUsers();
      const newUserMap = new Map<string, string>();
      data.forEach((item) => {
        newUserMap.set(item.id, item.name);
      });
      setUserMap(newUserMap);
    };
    //массив рецензия
    const fetchReviews = async () => {
      try {
        const data = await getReviews();
        const newReviewsMap = new Map<
          string,
          { userId: string; text: string }
        >();
        data.forEach((item) => {
          const { userId, id, text } = item;
          newReviewsMap.set(id, { userId, text });
        });
        setReviewsMap(newReviewsMap);
      } catch (error) {
        console.error(error);
      }
    };

    fetchReviews();
    fetchUserMap();
    fetchBooks();
    console.log(reviews);
  }, []);

  return (
    <div>
      <h1>Мои книги:</h1>
      {isLoading && <div>Загрузка...</div>}
      {!isLoading &&
        books.map((b) => (
          <Card key={b.id} book={toBookInformation(b, userMap, reviews)} />
        ))}
    </div>
  );
};

export default App;

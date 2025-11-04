import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext.tsx';
import { PreparationCourse, PreparationBook, UpcomingExam } from '../types.ts';
import Icon from '../components/Icon.tsx';
import PublicHeader from '../components/PublicHeader.tsx';
import PublicFooter from '../components/PublicFooter.tsx';

const UpcomingExamDeadlineCard: React.FC<{ exam: UpcomingExam }> = ({ exam }) => {
    const deadline = new Date(exam.deadline);
    // Adjust for timezone to prevent date from being off by one
    deadline.setMinutes(deadline.getMinutes() + deadline.getTimezoneOffset());
    const day = deadline.getDate();
    const month = deadline.toLocaleString('default', { month: 'short' }).toUpperCase();

    return (
        <div className="flex items-center justify-between gap-4 border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
            <div className="flex items-center gap-4 flex-grow min-w-0">
                <div className="w-14 h-14 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-lg flex flex-col items-center justify-center font-bold text-center leading-none flex-shrink-0">
                    <span className="text-xl">{day}</span>
                    <span className="text-xs font-semibold">{month}</span>
                </div>
                <div className="flex-grow min-w-0">
                    <p className="font-bold text-gray-800 leading-tight truncate">{exam.name}</p>
                </div>
            </div>
            <div className="flex-shrink-0 ml-4">
                <a 
                    href={exam.notificationLink} 
                    target="_blank" 
                    rel="nofollow noopener noreferrer"
                    className="text-sm bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-md font-semibold hover:bg-gray-50 hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-all whitespace-nowrap"
                >
                    View Notification
                </a>
            </div>
        </div>
    );
};

const CourseCard: React.FC<{ course: PreparationCourse }> = ({ course }) => (
    <div className="border rounded-lg p-5 flex flex-col bg-white hover:shadow-lg hover:border-[var(--primary-color)] transition-all duration-300">
        <div className="flex-grow">
            <p className="font-bold text-lg text-gray-800">{course.title}</p>
            <p className="text-sm text-gray-500 mb-4">Platform: {course.platform}</p>
        </div>
        <a href={course.url} target="_blank" rel="noopener noreferrer nofollow" className="mt-2 text-sm bg-[var(--primary-color)] text-white text-center px-4 py-2 rounded-md font-semibold filter hover:brightness-90 flex items-center justify-center gap-2">
            <Icon name="external-link-alt" className="text-xs" />
            View Course
        </a>
    </div>
);

const BookCard: React.FC<{ book: PreparationBook }> = ({ book }) => (
    <div className="border rounded-lg p-5 text-center flex flex-col bg-white hover:shadow-lg hover:border-[var(--primary-color)] transition-all duration-300">
        <div className="flex-grow">
            {book.imageUrl && <img src={book.imageUrl} alt={book.title} className="h-40 mx-auto mb-3 object-contain" loading="lazy" />}
            <div>
                <p className="font-bold text-gray-800 text-sm">{book.title}</p>
                <p className="text-xs text-gray-500 mb-3">by {book.author}</p>
            </div>
        </div>
        <a href={book.url} target="_blank" rel="noopener noreferrer nofollow" className="mt-2 text-sm bg-yellow-500 text-black px-4 py-2 rounded-md font-semibold hover:bg-yellow-600 flex items-center justify-center gap-2">
            <Icon prefix="fab" name="amazon" />
            Buy on Amazon
        </a>
    </div>
);


const PreparationPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
    const { preparationCourses, preparationBooks, upcomingExams } = useData();

    const sortedUpcomingExams = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return upcomingExams
            .filter(exam => new Date(exam.deadline) >= today)
            .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    }, [upcomingExams]);
    

    return (
        <div className="public-website bg-gray-50">
            <PublicHeader navigate={navigate} />

            <main className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-extrabold text-center text-[#1e3c72] mb-8">Government Exam Preparation</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-12">
                        {preparationCourses.length > 0 && (
                            <section>
                                <h2 className="text-3xl font-bold text-[#1e3c72] my-6 pb-2 border-b-4 border-[var(--accent-color)]">Best Courses</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {preparationCourses.map(course => <CourseCard key={course.id} course={course} />)}
                                </div>
                            </section>
                        )}
                        
                        {preparationBooks.length > 0 && (
                             <section>
                                <h2 className="text-3xl font-bold text-[#1e3c72] my-6 pb-2 border-b-4 border-[var(--accent-color)]">Top Recommended Books</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {preparationBooks.map(book => <BookCard key={book.id} book={book} />)}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-8 sticky top-24 h-fit">
                        {sortedUpcomingExams.length > 0 && (
                            <div className="widget bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-bold text-[#1e3c72] mb-4 pb-2 border-b-2 border-[var(--accent-color)]">Upcoming Exam Deadlines</h3>
                                <div className="space-y-4">
                                    {sortedUpcomingExams.map(exam => (
                                        <UpcomingExamDeadlineCard key={exam.id} exam={exam} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </main>

            <PublicFooter navigate={navigate} />
        </div>
    );
};

export default PreparationPage;
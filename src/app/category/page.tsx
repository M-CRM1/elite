'use client';
import { useEffect, useState } from 'react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false); 

  return (
    <div className='flex flex-col items-center mt-5' style={{ padding: '20px' }}>
      <h1>ДОБАВЛЕНИЕ  КОТЕГОРИИ ДЛЯ БАНЕРА</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className='flex flex-row justify-between w-full max-w-4xl'>
        <div className='flex-1 mr-4'>
          <button 
            className='mb-4 bg-blue-500 text-white p-2 rounded' 
            onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? 'Oтмена' : 'Добавить котегорию +'}
          </button>
          {isLoading ? (
            <p>Загрузка категорий...</p>
          ) : (
            <ul>
              <li> Barbara Residence (3)</li>
              <li>Категории не найдены.</li>  
            </ul>
          )}
        </div>

        <div className='flex-1'>
          {showForm && (
            <form  className='flex flex-col items-start'>
              <label htmlFor="category">Название  котегории </label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="новая категория"
                required
                className='mb-2 border p-2 rounded'
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'СОХРАНИТЬ'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;

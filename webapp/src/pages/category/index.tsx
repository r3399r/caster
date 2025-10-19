import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import categoryEndpoint from 'src/api/categoryEndpoint';
import type { Category as TypeCategory } from 'src/model/backend/entity/CategoryEntity';
import { setCategoryId } from 'src/redux/uiSlice';

const Category = () => {
  const [category, setCategory] = useState<TypeCategory[]>();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    categoryEndpoint.getCategory().then((res) => {
      setCategory(res?.data);
    });
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {category?.map((v) => (
        <div
          key={v.id}
          className="cursor-pointer rounded border px-2 py-1"
          onClick={() => {
            localStorage.setItem('categoryId', v.id.toString());
            dispatch(setCategoryId(v.id));
            navigate('/');
          }}
        >
          {v.name}
        </div>
      ))}
    </div>
  );
};

export default Category;

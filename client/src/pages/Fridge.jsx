import React from 'react'
import FridgeList from '../coponents/FridgeList'
import { Link } from 'react-router-dom'
import { AuthContext } from '../AuthContext'
import { useContext } from 'react'
import { useQuery } from '@tanstack/react-query'


const baseURL = import.meta.env.VITE_BASE_URL
async function fetchFridge(id) {
  const response = await fetch(`${baseURL}/fridge/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });


  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Network response was not ok (${response.status})`);
  }

  return response.json();
}


function Fridge() {
  const { user } = useContext(AuthContext)


  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['fridge'],
    queryFn: () => fetchFridge(user.id),
  });

  const listItem = data;


  if (isLoading) {
    return (
      <div className='fridge min-h-screen bg-white-bg w-full flex flex-col items-center justify-center py-[2.5rem] px-[2rem] gap-[3.25rem] '>
        <p>Loading fridge...</p>
      </div>
    );
  }


  return (
    <div className='fridge min-h-screen bg-white-bg w-full flex flex-col items-center py-[2.5rem] px-[2rem] gap-[3.25rem] '>
      {/* Arrow */}
      <div className="arrow-wrapper w-full ">
        <svg width="24" height="19" viewBox="0 0 24 19" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.3447 17.8245C10.0321 18.137 9.60828 18.3125 9.16634 18.3125C8.7244 18.3125 8.30055 18.137 7.98801 17.8245L0.488008 10.3245C0.175556 10.012 3.05176e-05 9.58813 3.05176e-05 9.14619C3.05176e-05 8.70425 0.175556 8.2804 0.488008 7.96785L7.98801 0.467854C8.30235 0.164257 8.72335 -0.00373459 9.16034 6.29425e-05C9.59734 0.00386047 10.0154 0.179142 10.3244 0.488155C10.6334 0.797169 10.8087 1.21519 10.8125 1.65219C10.8163 2.08918 10.6483 2.51018 10.3447 2.82452L5.83301 7.47952L21.6663 7.47952C22.1084 7.47952 22.5323 7.65511 22.8449 7.96768C23.1574 8.28024 23.333 8.70416 23.333 9.14619C23.333 9.58821 23.1574 10.0121 22.8449 10.3247C22.5323 10.6373 22.1084 10.8129 21.6663 10.8129L5.83301 10.8129L10.3447 15.4679C10.6571 15.7804 10.8327 16.2042 10.8327 16.6462C10.8327 17.0881 10.6571 17.512 10.3447 17.8245Z" fill="#FCDB29" />
        </svg>
      </div>

      {/* Content */}
      <div className="content-section flex flex-col items-center w-full gap-[1rem] ">
        <h2>ตู้เย็นของ บอล</h2>

        {listItem && listItem.length > 0 ? (
          listItem.map((items) => (
            <FridgeList key={items.id} id={items.id} material={items.material} exp={items.exp} />
          ))
        ) : (
          <p>ยังไม่มีอาหารในตู้เย็น กดเพิ่ม ➕ ได้ด้านล่างเลยครับ</p>
        )}


      </div>


      <Link to={'/fridge/add-to-fridge'} >
        <div className="add-food flex flex-col items-center justify-center ">
          {/* Plus SVG */}
          <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M15.3333 5.11111C15.3333 3.75556 15.8718 2.45553 16.8303 1.49701C17.7889 0.53849 19.0889 0 20.4444 0H25.5556C26.9111 0 28.2111 0.53849 29.1697 1.49701C30.1282 2.45553 30.6667 3.75556 30.6667 5.11111V15.3333H40.8889C42.2444 15.3333 43.5445 15.8718 44.503 16.8303C45.4615 17.7889 46 19.0889 46 20.4444V25.5556C46 26.9111 45.4615 28.2111 44.503 29.1697C43.5445 30.1282 42.2444 30.6667 40.8889 30.6667H30.6667V40.8889C30.6667 42.2444 30.1282 43.5445 29.1697 44.503C28.2111 45.4615 26.9111 46 25.5556 46H20.4444C19.0889 46 17.7889 45.4615 16.8303 44.503C15.8718 43.5445 15.3333 42.2444 15.3333 40.8889V30.6667H5.11111C3.75556 30.6667 2.45553 30.1282 1.49701 29.1697C0.53849 28.2111 0 26.9111 0 25.5556V20.4444C0 19.0889 0.53849 17.7889 1.49701 16.8303C2.45553 15.8718 3.75556 15.3333 5.11111 15.3333H15.3333V5.11111ZM25.5556 5.11111H20.4444V17.8889C20.4444 18.5667 20.1752 19.2167 19.6959 19.6959C19.2167 20.1752 18.5667 20.4444 17.8889 20.4444H5.11111V25.5556H17.8889C18.5667 25.5556 19.2167 25.8248 19.6959 26.3041C20.1752 26.7833 20.4444 27.4333 20.4444 28.1111V40.8889H25.5556V28.1111C25.5556 27.4333 25.8248 26.7833 26.3041 26.3041C26.7833 25.8248 27.4333 25.5556 28.1111 25.5556H40.8889V20.4444H28.1111C27.4333 20.4444 26.7833 20.1752 26.3041 19.6959C25.8248 19.2167 25.5556 18.5667 25.5556 17.8889V5.11111Z" fill="#34332F" />
          </svg>

          <p className='text-secondary ' >เพิ่มอาหารในตู้เย็น</p>

        </div>
      </Link>

    </div>
  )
}

export default Fridge

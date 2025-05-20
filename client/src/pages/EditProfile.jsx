import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AuthContext } from '../AuthContext';
import styles from '../section/style/EditProfile.module.css';

import BackArrow from '../coponents/BackArrow';
import CustomButton from '../coponents/CustomButton';
import Crop from '../coponents/Crop';


//******* Edit Profile Function *******//
//**********************************//
const baseURL = import.meta.env.VITE_BASE_URL;

async function updateProfile(data) {
  const response = await fetch(`${baseURL}/edit-profile`, {
    method: 'PATCH',
    body: data,
    credentials: 'include'
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update profile');
  }

  return await response.json();
}


// Main Component
function EditProfile() {
  const { user, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    address: '',
    zip_code: '',
    ig: '',
    line: ''
  });
  const [error, setError] = useState('');
  const [image, setImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);


  //******* Load User Data *******//
  //****************************//
  useEffect(() => {
    if (user) {
      setFormData({
        fname: user.fname || '',
        lname: user.lname || '',
        address: user.address || '',
        zip_code: user.zip_code || '',
        ig: user.ig || '',
        line: user.line || '',
        pic: user.pic || ''
      });
    }
  }, [user]);


  //******* Mutation *******//
  //***********************//
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      console.log('Profile updated successfully', data);
      refreshUser();
      navigate('/profile');
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
      setError(error.message);
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const submitData = new FormData();
    submitData.append('fname', formData.fname);
    submitData.append('lname', formData.lname);
    submitData.append('address', formData.address);
    submitData.append('zip_code', formData.zip_code);
    submitData.append('ig', formData.ig);
    submitData.append('line', formData.line);
    
    if (croppedImage) {
      fetch(croppedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
          submitData.append('pic', file);
          
          mutation.mutate(submitData);
        });
    } else {
      mutation.mutate(submitData);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };


  //******* Handle File Change *******//
  //********************************//
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  
  return (
    <div className={`${styles.editProfile} profile `}>
      <div className="arrow py-[2.5rem] ">
        <BackArrow />
      </div>

      {/* avatar */}
      <input type="file" accept="image/*" onChange={handleFileChange} className={`${styles.avatar} `} />
      {image && !croppedImage && (
        <Crop imageSrc={image} onCropDone={setCroppedImage} />
      )}
      {croppedImage && (
        <div className='size-[10.75rem] rounded-full overflow-hidden absolute left-1/2 -translate-x-1/2 top-[8rem] '>
          <img src={croppedImage} alt="Cropped" className='w-full h-full object-cover' />
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="text-red-500 mb-4 text-center">
          {error}
        </div>
      )}

      {/* ฟอร์ม */}
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <input
          className={styles.inputField}
          type="text"
          placeholder="ชื่อ"
          name="fname"
          value={formData.fname}
          onChange={handleChange}
        />
        <input
          className={styles.inputField}
          type="text"
          placeholder="นามสกุล"
          name="lname"
          value={formData.lname}
          onChange={handleChange}
        />
        <input
          className={styles.inputField}
          type="text"
          placeholder="ที่อยู่"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />
        <input
          className={styles.inputField}
          type="text"
          placeholder="รหัสไปรษณีย์"
          name="zip_code"
          value={formData.zip_code}
          onChange={handleChange}
        />
        <input
          className={styles.inputField}
          type="text"
          placeholder="IG"
          name="ig"
          value={formData.ig}
          onChange={handleChange}
        />
        <input
          className={styles.inputField}
          type="text"
          placeholder="Line"
          name="line"
          value={formData.line}
          onChange={handleChange}
        />

        <div className={styles.buttons}>
          <button
            type="button"
            className={`${styles.button} ${styles.cancelBtn}`}
            onClick={handleCancel}
            disabled={mutation.isPending}
          >
            ยกเลิก
          </button>

          <CustomButton
            type="submit"
            className={`${styles.button} ${styles.saveBtn}`}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
          </CustomButton>

        </div>
      </form>
    </div>
  );
}

export default EditProfile;

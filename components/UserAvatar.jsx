'use client'
import React from 'react'
import { 
  FaUser, FaUserTie, FaUserGraduate, FaUserNinja, FaUserAstronaut,
  FaUserSecret, FaUserCog, FaUserMd, FaUserEdit, FaUserShield,
  FaRegUser, FaRegUserCircle, FaUserCheck, FaUserClock, FaUserFriends,
  FaUserPlus, FaUserTag, FaUserTimes, FaUsers, FaChild
} from 'react-icons/fa'
import { 
  HiUser, HiUserCircle, HiUserGroup 
} from 'react-icons/hi'
import { 
  BsPersonFill, BsPersonCircle, BsPersonCheck, BsPersonDash,
  BsPersonPlus, BsPersonX, BsPerson, BsPersonBadge, BsPersonHeart,
  BsPersonLinesFill, BsPersonPlusFill, BsPersonSquare, BsPersonWorkspace
} from 'react-icons/bs'
import { 
  IoPersonCircle, IoPerson, IoPersonAdd, IoPersonOutline,
  IoPersonSharp, IoPersonCircleOutline, IoPersonCircleSharp
} from 'react-icons/io5'
import { 
  MdPerson, MdPersonOutline, MdPersonAdd, MdPersonPin, MdPersonPinCircle 
} from 'react-icons/md'

const UserAvatar = ({ 
  userId, 
  userName, 
  size = 48, 
  className = "", 
  showInitials = false 
}) => {
  // Array of different user icons
  const userIcons = [
    FaUser, FaUserTie, FaUserGraduate, FaUserNinja, FaUserAstronaut,
    FaUserSecret, FaUserCog, FaUserMd, FaUserEdit, FaUserShield,
    FaRegUser, FaRegUserCircle, FaUserCheck, FaUserClock, FaUserFriends,
    FaUserPlus, FaUserTag, FaUsers, FaChild,
    HiUser, HiUserCircle, HiUserGroup,
    BsPersonFill, BsPersonCircle, BsPersonCheck, BsPersonDash,
    BsPersonPlus, BsPersonX, BsPerson, BsPersonBadge, BsPersonHeart,
    BsPersonLinesFill, BsPersonPlusFill, BsPersonSquare, BsPersonWorkspace,
    IoPersonCircle, IoPerson, IoPersonAdd, IoPersonOutline,
    IoPersonSharp, IoPersonCircleOutline, IoPersonCircleSharp,
    MdPerson, MdPersonOutline, MdPersonAdd, MdPersonPin, MdPersonPinCircle
  ]

  // Array of attractive colors for avatars
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500',
    'bg-red-500', 'bg-yellow-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500',
    'bg-lime-500', 'bg-emerald-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-rose-500',
    'bg-sky-500', 'bg-amber-500', 'bg-slate-500', 'bg-zinc-500', 'bg-neutral-500'
  ]

  // Generate a consistent index based on userId or userName
  const generateIndex = (str) => {
    let hash = 0
    if (str) {
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
      }
    }
    return Math.abs(hash)
  }

  const identifier = userId || userName || 'default'
  const iconIndex = generateIndex(identifier) % userIcons.length
  const colorIndex = generateIndex(identifier + 'color') % colors.length
  
  const IconComponent = userIcons[iconIndex]
  const bgColor = colors[colorIndex]

  // Generate initials from username
  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2)
  }

  if (showInitials && userName) {
    return (
      <div 
        className={`${bgColor} ${className} rounded-full flex items-center justify-center text-white font-semibold`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {getInitials(userName)}
      </div>
    )
  }

  return (
    <div 
      className={`${bgColor} ${className} rounded-full flex items-center justify-center text-white`}
      style={{ width: size, height: size }}
    >
      <IconComponent 
        size={size * 0.6} 
        className="drop-shadow-sm"
      />
    </div>
  )
}

export default UserAvatar

'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Smile,
  Leaf,
  Coffee,
  Trophy,
  Car,
  Lightbulb,
  Music,
  Flag,
  Search,
} from 'lucide-react';

export interface EmojiItem {
  char: string;
  name: string;
  shortcode: string;
  category: 'smileys' | 'animals' | 'food' | 'activity' | 'travel' | 'objects' | 'symbols' | 'flags';
}

export const EMOJI_DATA: EmojiItem[] = [
  // 1. Smileys & People
  { char: '😀', name: 'grinning', shortcode: ':grinning:', category: 'smileys' },
  { char: '😃', name: 'smiley', shortcode: ':smiley:', category: 'smileys' },
  { char: '😄', name: 'smile', shortcode: ':smile:', category: 'smileys' },
  { char: '😁', name: 'grin', shortcode: ':grin:', category: 'smileys' },
  { char: '😆', name: 'laughing', shortcode: ':laughing:', category: 'smileys' },
  { char: '😅', name: 'sweat_smile', shortcode: ':sweat_smile:', category: 'smileys' },
  { char: '🤣', name: 'rofl', shortcode: ':rofl:', category: 'smileys' },
  { char: '😂', name: 'joy', shortcode: ':joy:', category: 'smileys' },
  { char: '🙂', name: 'slightly_smiling_face', shortcode: ':slightly_smiling_face:', category: 'smileys' },
  { char: '🙃', name: 'upside_down_face', shortcode: ':upside_down_face:', category: 'smileys' },
  { char: '🫠', name: 'melting_face', shortcode: ':melting_face:', category: 'smileys' },
  { char: '😉', name: 'wink', shortcode: ':wink:', category: 'smileys' },
  { char: '😊', name: 'blush', shortcode: ':blush:', category: 'smileys' },
  { char: '😇', name: 'innocent', shortcode: ':innocent:', category: 'smileys' },
  { char: '🥰', name: 'smiling_face_with_3_hearts', shortcode: ':smiling_face_with_3_hearts:', category: 'smileys' },
  { char: '😍', name: 'heart_eyes', shortcode: ':heart_eyes:', category: 'smileys' },
  { char: '🤩', name: 'star_struck', shortcode: ':star_struck:', category: 'smileys' },
  { char: '😘', name: 'kissing_heart', shortcode: ':kissing_heart:', category: 'smileys' },
  { char: '😗', name: 'kissing', shortcode: ':kissing:', category: 'smileys' },
  { char: '😚', name: 'kissing_closed_eyes', shortcode: ':kissing_closed_eyes:', category: 'smileys' },
  { char: '😙', name: 'kissing_smiling_eyes', shortcode: ':kissing_smiling_eyes:', category: 'smileys' },
  { char: '🥲', name: 'smiling_face_with_tear', shortcode: ':smiling_face_with_tear:', category: 'smileys' },
  { char: '😋', name: 'yum', shortcode: ':yum:', category: 'smileys' },
  { char: '😛', name: 'stuck_out_tongue', shortcode: ':stuck_out_tongue:', category: 'smileys' },
  { char: '😜', name: 'stuck_out_tongue_winking_eye', shortcode: ':stuck_out_tongue_winking_eye:', category: 'smileys' },
  { char: '🤪', name: 'zany_face', shortcode: ':zany_face:', category: 'smileys' },
  { char: '😝', name: 'stuck_out_tongue_closed_eyes', shortcode: ':stuck_out_tongue_closed_eyes:', category: 'smileys' },
  { char: '🤑', name: 'money_mouth_face', shortcode: ':money_mouth_face:', category: 'smileys' },
  { char: '🤗', name: 'hugs', shortcode: ':hugs:', category: 'smileys' },
  { char: '🤭', name: 'hand_over_mouth', shortcode: ':hand_over_mouth:', category: 'smileys' },
  { char: '🥱', name: 'yawning_face', shortcode: ':yawning_face:', category: 'smileys' },
  { char: '🤫', name: 'shushing_face', shortcode: ':shushing_face:', category: 'smileys' },
  { char: '🤔', name: 'thinking', shortcode: ':thinking:', category: 'smileys' },
  { char: '🫡', name: 'saluting_face', shortcode: ':saluting_face:', category: 'smileys' },
  { char: '🤐', name: 'zipper_mouth_face', shortcode: ':zipper_mouth_face:', category: 'smileys' },
  { char: '🤨', name: 'raised_eyebrow', shortcode: ':raised_eyebrow:', category: 'smileys' },
  { char: '😐', name: 'neutral_face', shortcode: ':neutral_face:', category: 'smileys' },
  { char: '😎', name: 'sunglasses', shortcode: ':sunglasses:', category: 'smileys' },
  { char: '🤓', name: 'nerd_face', shortcode: ':nerd_face:', category: 'smileys' },
  { char: '🥳', name: 'partying_face', shortcode: ':partying_face:', category: 'smileys' },

  // 2. Animals & Nature
  { char: '🐶', name: 'dog', shortcode: ':dog:', category: 'animals' },
  { char: '🐱', name: 'cat', shortcode: ':cat:', category: 'animals' },
  { char: '🐭', name: 'mouse', shortcode: ':mouse:', category: 'animals' },
  { char: '🐹', name: 'hamster', shortcode: ':hamster:', category: 'animals' },
  { char: '🐰', name: 'rabbit', shortcode: ':rabbit:', category: 'animals' },
  { char: '🦊', name: 'fox', shortcode: ':fox:', category: 'animals' },
  { char: '🐻', name: 'bear', shortcode: ':bear:', category: 'animals' },
  { char: '🐼', name: 'panda', shortcode: ':panda:', category: 'animals' },
  { char: '🐨', name: 'koala', shortcode: ':koala:', category: 'animals' },
  { char: '🐯', name: 'tiger', shortcode: ':tiger:', category: 'animals' },
  { char: '🦁', name: 'lion', shortcode: ':lion:', category: 'animals' },
  { char: '🐮', name: 'cow', shortcode: ':cow:', category: 'animals' },
  { char: '🐷', name: 'pig', shortcode: ':pig:', category: 'animals' },
  { char: '🐸', name: 'frog', shortcode: ':frog:', category: 'animals' },
  { char: '🐵', name: 'monkey', shortcode: ':monkey:', category: 'animals' },
  { char: '🐔', name: 'chicken', shortcode: ':chicken:', category: 'animals' },
  { char: '🐧', name: 'penguin', shortcode: ':penguin:', category: 'animals' },
  { char: '🐦', name: 'bird', shortcode: ':bird:', category: 'animals' },
  { char: '🦆', name: 'duck', shortcode: ':duck:', category: 'animals' },
  { char: '🦅', name: 'eagle', shortcode: ':eagle:', category: 'animals' },
  { char: '🌲', name: 'evergreen_tree', shortcode: ':evergreen_tree:', category: 'animals' },
  { char: '🌳', name: 'deciduous_tree', shortcode: ':deciduous_tree:', category: 'animals' },
  { char: '🌴', name: 'palm_tree', shortcode: ':palm_tree:', category: 'animals' },
  { char: '🌱', name: 'seedling', shortcode: ':seedling:', category: 'animals' },
  { char: '🌿', name: 'herb', shortcode: ':herb:', category: 'animals' },
  { char: '☘️', name: 'shamrock', shortcode: ':shamrock:', category: 'animals' },
  { char: '🍀', name: 'four_leaf_clover', shortcode: ':four_leaf_clover:', category: 'animals' },
  { char: '🌸', name: 'cherry_blossom', shortcode: ':cherry_blossom:', category: 'animals' },

  // 3. Food & Drink
  { char: '🍏', name: 'green_apple', shortcode: ':green_apple:', category: 'food' },
  { char: '🍎', name: 'apple', shortcode: ':apple:', category: 'food' },
  { char: '🍐', name: 'pear', shortcode: ':pear:', category: 'food' },
  { char: '🍊', name: 'orange', shortcode: ':orange:', category: 'food' },
  { char: '🍋', name: 'lemon', shortcode: ':lemon:', category: 'food' },
  { char: '🍌', name: 'banana', shortcode: ':banana:', category: 'food' },
  { char: '🍉', name: 'watermelon', shortcode: ':watermelon:', category: 'food' },
  { char: '🍇', name: 'grapes', shortcode: ':grapes:', category: 'food' },
  { char: '🍓', name: 'strawberry', shortcode: ':strawberry:', category: 'food' },
  { char: '🫐', name: 'blueberries', shortcode: ':blueberries:', category: 'food' },
  { char: '🍈', name: 'melon', shortcode: ':melon:', category: 'food' },
  { char: '🍒', name: 'cherries', shortcode: ':cherries:', category: 'food' },
  { char: '🍑', name: 'peach', shortcode: ':peach:', category: 'food' },
  { char: '🍕', name: 'pizza', shortcode: ':pizza:', category: 'food' },
  { char: '🍔', name: 'hamburger', shortcode: ':hamburger:', category: 'food' },
  { char: '🍟', name: 'fries', shortcode: ':fries:', category: 'food' },
  { char: '🥪', name: 'sandwich', shortcode: ':sandwich:', category: 'food' },
  { char: '🌮', name: 'taco', shortcode: ':taco:', category: 'food' },
  { char: '🍣', name: 'sushi', shortcode: ':sushi:', category: 'food' },
  { char: '☕', name: 'coffee', shortcode: ':coffee:', category: 'food' },
  { char: '🍵', name: 'tea', shortcode: ':tea:', category: 'food' },
  { char: '🧃', name: 'beverage_box', shortcode: ':beverage_box:', category: 'food' },

  // 4. Activities
  { char: '⚽', name: 'soccer', shortcode: ':soccer:', category: 'activity' },
  { char: '🏀', name: 'basketball', shortcode: ':basketball:', category: 'activity' },
  { char: '🏈', name: 'football', shortcode: ':football:', category: 'activity' },
  { char: '⚾', name: 'baseball', shortcode: ':baseball:', category: 'activity' },
  { char: '🥎', name: 'softball', shortcode: ':softball:', category: 'activity' },
  { char: '🎾', name: 'tennis', shortcode: ':tennis:', category: 'activity' },
  { char: '🏐', name: 'volleyball', shortcode: ':volleyball:', category: 'activity' },
  { char: '🏉', name: 'rugby_football', shortcode: ':rugby_football:', category: 'activity' },
  { char: '🥏', name: 'flying_disc', shortcode: ':flying_disc:', category: 'activity' },
  { char: '🎱', name: 'pool_8ball', shortcode: ':8ball:', category: 'activity' },
  { char: '🏓', name: 'ping_pong', shortcode: ':ping_pong:', category: 'activity' },
  { char: '🏸', name: 'badminton', shortcode: ':badminton:', category: 'activity' },
  { char: '🥊', name: 'boxing_glove', shortcode: ':boxing_glove:', category: 'activity' },
  { char: '🎯', name: 'dart', shortcode: ':dart:', category: 'activity' },
  { char: '⛳', name: 'golf', shortcode: ':golf:', category: 'activity' },
  { char: '🎮', name: 'video_game', shortcode: ':video_game:', category: 'activity' },
  { char: '🎲', name: 'game_die', shortcode: ':game_die:', category: 'activity' },
  { char: '🏆', name: 'trophy', shortcode: ':trophy:', category: 'activity' },
  { char: '🥇', name: 'first_place_medal', shortcode: ':first_place_medal:', category: 'activity' },
  { char: '🎨', name: 'art', shortcode: ':art:', category: 'activity' },

  // 5. Travel & Places
  { char: '🚀', name: 'rocket', shortcode: ':rocket:', category: 'travel' },
  { char: '🚗', name: 'car', shortcode: ':car:', category: 'travel' },
  { char: '🚕', name: 'taxi', shortcode: ':taxi:', category: 'travel' },
  { char: '🚙', name: 'blue_car', shortcode: ':blue_car:', category: 'travel' },
  { char: '🚌', name: 'bus', shortcode: ':bus:', category: 'travel' },
  { char: '🏎️', name: 'racing_car', shortcode: ':racing_car:', category: 'travel' },
  { char: '🚓', name: 'police_car', shortcode: ':police_car:', category: 'travel' },
  { char: '🚑', name: 'ambulance', shortcode: ':ambulance:', category: 'travel' },
  { char: '🚒', name: 'fire_engine', shortcode: ':fire_engine:', category: 'travel' },
  { char: '✈️', name: 'airplane', shortcode: ':airplane:', category: 'travel' },
  { char: '🚁', name: 'helicopter', shortcode: ':helicopter:', category: 'travel' },
  { char: '🛸', name: 'flying_saucer', shortcode: ':flying_saucer:', category: 'travel' },
  { char: '🚂', name: 'steam_locomotive', shortcode: ':steam_locomotive:', category: 'travel' },
  { char: '⛵', name: 'sailboat', shortcode: ':sailboat:', category: 'travel' },
  { char: '🚢', name: 'ship', shortcode: ':ship:', category: 'travel' },
  { char: '⚓', name: 'anchor', shortcode: ':anchor:', category: 'travel' },
  { char: '🌍', name: 'earth_africa', shortcode: ':earth_africa:', category: 'travel' },
  { char: '🌎', name: 'earth_americas', shortcode: ':earth_americas:', category: 'travel' },
  { char: '🌏', name: 'earth_asia', shortcode: ':earth_asia:', category: 'travel' },
  { char: '🗺️', name: 'world_map', shortcode: ':world_map:', category: 'travel' },
  { char: '🧭', name: 'compass', shortcode: ':compass:', category: 'travel' },
  { char: '🏔️', name: 'mountain_snow', shortcode: ':mountain_snow:', category: 'travel' },
  { char: '⛺', name: 'tent', shortcode: ':tent:', category: 'travel' },
  { char: '🏝️', name: 'desert_island', shortcode: ':desert_island:', category: 'travel' },

  // 6. Objects
  { char: '💡', name: 'bulb', shortcode: ':bulb:', category: 'objects' },
  { char: '💻', name: 'laptop', shortcode: ':computer:', category: 'objects' },
  { char: '📱', name: 'iphone', shortcode: ':iphone:', category: 'objects' },
  { char: '⌚', name: 'watch', shortcode: ':watch:', category: 'objects' },
  { char: '⏰', name: 'alarm_clock', shortcode: ':alarm_clock:', category: 'objects' },
  { char: '🗓️', name: 'calendar', shortcode: ':calendar:', category: 'objects' },
  { char: '📁', name: 'file_folder', shortcode: ':file_folder:', category: 'objects' },
  { char: '📋', name: 'clipboard', shortcode: ':clipboard:', category: 'objects' },
  { char: '📌', name: 'pushpin', shortcode: ':pushpin:', category: 'objects' },
  { char: '📍', name: 'round_pushpin', shortcode: ':round_pushpin:', category: 'objects' },
  { char: '📎', name: 'paperclip', shortcode: ':paperclip:', category: 'objects' },
  { char: '📏', name: 'straight_ruler', shortcode: ':straight_ruler:', category: 'objects' },
  { char: '📐', name: 'triangular_ruler', shortcode: ':triangular_ruler:', category: 'objects' },
  { char: '🔒', name: 'lock', shortcode: ':lock:', category: 'objects' },
  { char: '🔓', name: 'unlock', shortcode: ':unlock:', category: 'objects' },
  { char: '🔑', name: 'key', shortcode: ':key:', category: 'objects' },
  { char: '🔨', name: 'hammer', shortcode: ':hammer:', category: 'objects' },
  { char: '🛠️', name: 'tools', shortcode: ':tools:', category: 'objects' },
  { char: '📦', name: 'package', shortcode: ':package:', category: 'objects' },
  { char: '📬', name: 'mailbox_with_mail', shortcode: ':mailbox_with_mail:', category: 'objects' },
  { char: '📝', name: 'memo', shortcode: ':memo:', category: 'objects' },
  { char: '✏️', name: 'pencil2', shortcode: ':pencil2:', category: 'objects' },

  // 7. Symbols
  { char: '❤️', name: 'heart', shortcode: ':heart:', category: 'symbols' },
  { char: '🧡', name: 'orange_heart', shortcode: ':orange_heart:', category: 'symbols' },
  { char: '💛', name: 'yellow_heart', shortcode: ':yellow_heart:', category: 'symbols' },
  { char: '💚', name: 'green_heart', shortcode: ':green_heart:', category: 'symbols' },
  { char: '💙', name: 'blue_heart', shortcode: ':blue_heart:', category: 'symbols' },
  { char: '💜', name: 'purple_heart', shortcode: ':purple_heart:', category: 'symbols' },
  { char: '🖤', name: 'black_heart', shortcode: ':black_heart:', category: 'symbols' },
  { char: '🤍', name: 'white_heart', shortcode: ':white_heart:', category: 'symbols' },
  { char: '🤎', name: 'brown_heart', shortcode: ':brown_heart:', category: 'symbols' },
  { char: '💔', name: 'broken_heart', shortcode: ':broken_heart:', category: 'symbols' },
  { char: '✨', name: 'sparkles', shortcode: ':sparkles:', category: 'symbols' },
  { char: '⭐', name: 'star', shortcode: ':star:', category: 'symbols' },
  { char: '🌟', name: 'star2', shortcode: ':star2:', category: 'symbols' },
  { char: '💫', name: 'dizzy', shortcode: ':dizzy:', category: 'symbols' },
  { char: '💥', name: 'boom', shortcode: ':boom:', category: 'symbols' },
  { char: '🔥', name: 'fire', shortcode: ':fire:', category: 'symbols' },
  { char: '🎉', name: 'tada', shortcode: ':tada:', category: 'symbols' },
  { char: '🎊', name: 'confetti_ball', shortcode: ':confetti_ball:', category: 'symbols' },
  { char: '✅', name: 'white_check_mark', shortcode: ':white_check_mark:', category: 'symbols' },
  { char: '❌', name: 'x', shortcode: ':x:', category: 'symbols' },
  { char: '⚠️', name: 'warning', shortcode: ':warning:', category: 'symbols' },
  { char: '⚡', name: 'zap', shortcode: ':zap:', category: 'symbols' },

  // 8. Flags
  { char: '🏁', name: 'chequered_flag', shortcode: ':checkered_flag:', category: 'flags' },
  { char: '🚩', name: 'triangular_flag_on_post', shortcode: ':triangular_flag_on_post:', category: 'flags' },
  { char: '🎌', name: 'crossed_flags', shortcode: ':crossed_flags:', category: 'flags' },
  { char: '🏴', name: 'black_flag', shortcode: ':black_flag:', category: 'flags' },
  { char: '🏳️', name: 'white_flag', shortcode: ':white_flag:', category: 'flags' },
  { char: '🏳️‍🌈', name: 'rainbow_flag', shortcode: ':rainbow_flag:', category: 'flags' },
];

const CATEGORIES = [
  { id: 'smileys', label: 'Smileys & People', icon: Smile },
  { id: 'animals', label: 'Animals & Nature', icon: Leaf },
  { id: 'food', label: 'Food & Drink', icon: Coffee },
  { id: 'activity', label: 'Activities', icon: Trophy },
  { id: 'travel', label: 'Travel & Places', icon: Car },
  { id: 'objects', label: 'Objects', icon: Lightbulb },
  { id: 'symbols', label: 'Symbols', icon: Music },
  { id: 'flags', label: 'Flags', icon: Flag },
] as const;

interface EmojiPickerPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (char: string) => void;
  onClear?: () => void;
  currentEmoji?: string;
  className?: string;
}

export default function EmojiPickerPopover({
  isOpen,
  onClose,
  onSelectEmoji,
  onClear,
  currentEmoji,
  className = '',
}: EmojiPickerPopoverProps) {
  const [activeCategory, setActiveCategory] = useState<typeof CATEGORIES[number]['id']>('smileys');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredEmoji, setHoveredEmoji] = useState<EmojiItem>(
    EMOJI_DATA.find((e) => e.char === currentEmoji) || EMOJI_DATA[1] // Default: smiley
  );

  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const filteredEmojis = useMemo(() => {
    if (!searchQuery.trim()) {
      return EMOJI_DATA.filter((e) => e.category === activeCategory);
    }
    const q = searchQuery.toLowerCase().trim();
    return EMOJI_DATA.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.shortcode.toLowerCase().includes(q) ||
        e.char.includes(q)
    );
  }, [searchQuery, activeCategory]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className={`w-[320px] bg-[#1e1f21] border border-[#3b3d42] rounded-xl shadow-2xl flex flex-col z-50 text-white animate-in fade-in zoom-in-95 duration-150 select-none ${className}`}
    >
      {/* 1. Top Bar: Icon label + Clear button */}
      <div className="h-10 px-3.5 flex items-center justify-between border-b border-[#2b2c2e]">
        <span className="text-[13px] font-semibold text-white">Icon</span>
        {onClear && (
          <button
            type="button"
            onClick={() => {
              onClear();
              onClose();
            }}
            className="text-[12px] text-[#8a8886] hover:text-white transition-colors cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* 2. Category Icons Navigation Bar */}
      <div className="flex items-center justify-between px-2 pt-2 pb-1 border-b border-[#2b2c2e]">
        {CATEGORIES.map((cat) => {
          const IconComp = cat.icon;
          const isActive = activeCategory === cat.id && !searchQuery.trim();
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                setSearchQuery('');
              }}
              title={cat.label}
              className={`p-1.5 rounded relative transition-colors cursor-pointer ${
                isActive ? 'text-[#4573d2]' : 'text-[#8a8886] hover:text-white hover:bg-[#28292c]'
              }`}
            >
              <IconComp className="w-4 h-4" />
              {isActive && (
                <div className="absolute -bottom-1 left-1.5 right-1.5 h-[2px] bg-[#4573d2] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Search Bar */}
      <div className="p-3">
        <div className="flex items-center bg-[#252628] border border-[#37383b] focus-within:border-[#4573d2] rounded-full px-3 py-1.5 transition-colors">
          <Search className="w-3.5 h-3.5 text-[#8a8886] mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            autoFocus
            className="w-full bg-transparent text-[12.5px] text-white outline-none placeholder-[#8a8886]"
          />
        </div>
      </div>

      {/* 4. Category Title */}
      <div className="px-3 pb-1">
        <span className="text-[11px] font-semibold text-[#8a8886] uppercase tracking-wider">
          {searchQuery.trim()
            ? `Results (${filteredEmojis.length})`
            : CATEGORIES.find((c) => c.id === activeCategory)?.label}
        </span>
      </div>

      {/* 5. Emoji Grid */}
      <div className="p-2 max-h-[200px] min-h-[160px] overflow-y-auto">
        {filteredEmojis.length > 0 ? (
          <div className="grid grid-cols-8 gap-1">
            {filteredEmojis.map((emoji) => (
              <button
                key={emoji.name + emoji.char}
                type="button"
                onClick={() => {
                  onSelectEmoji(emoji.char);
                  onClose();
                }}
                onMouseEnter={() => setHoveredEmoji(emoji)}
                className={`w-8 h-8 rounded-md flex items-center justify-center text-[18px] hover:bg-[#2f3135] transition-all cursor-pointer ${
                  currentEmoji === emoji.char ? 'bg-[#1b2b48] border border-[#4573d2]' : ''
                }`}
              >
                {emoji.char}
              </button>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-[12px] text-[#8a8886]">
            No emojis found for &quot;{searchQuery}&quot;
          </div>
        )}
      </div>

      {/* 6. Bottom Preview Bar */}
      <div className="h-12 px-3 border-t border-[#2b2c2e] bg-[#1a1b1d] rounded-b-xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-[24px] leading-none">{hoveredEmoji.char}</span>
          <div className="flex flex-col">
            <span className="text-[12px] font-medium text-white leading-tight">
              {hoveredEmoji.name}
            </span>
            <span className="text-[10px] text-[#8a8886] leading-tight">
              {hoveredEmoji.shortcode}
            </span>
          </div>
        </div>

        {/* Skin tone indicator circle (Asana yellow circle) */}
        <div
          className="w-4 h-4 rounded-full bg-[#f7c644] border border-[#37383b] shadow-sm cursor-pointer hover:scale-110 transition-transform"
          title="Default skin tone"
        />
      </div>
    </div>
  );
}

declare module 'react-native-deck-swiper' {
    import { Component } from 'react';
    import { ViewStyle, TextStyle, ImageStyle } from 'react-native';
  
    export interface SwiperProps {
      cards: any[];
      renderCard: (card: any) => JSX.Element;
      onSwipedLeft?: (index: number) => void;
      onSwipedRight?: (index: number) => void;
      cardIndex?: number;
      stackSize?: number;
      backgroundColor?: string;
      style?: ViewStyle;
    }
  
    export default class Swiper extends Component<SwiperProps> {}
  }
  
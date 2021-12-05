import React, {useCallback, useState} from 'react'
import { PanGestureHandlerProps } from 'react-native-gesture-handler';
import { 
    NativeSyntheticEvent,
    Pressable,
    TextInputChangeEventData
} from 'react-native';
import { Box, useTheme, themeTools, useColorModeValue, HStack,
    Icon,
    Input,
    View
} from 'native-base';
import AnimatedCheckbox from './animated-checkbox';
import AnimatedTaskLabel from './animated-task-label';
import SwipeView from './swipable-view';
import {Feather} from '@expo/vector-icons'
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { onChange, runOnJS, useAnimatedGestureHandler, useAnimatedReaction, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';



function clamp(value:number, lowerBound:number, upperBound:number){
    'worklet';
    return Math.max(lowerBound,Math.min(value,upperBound));
}

function objectMove(object:any,from:any,to:any){
    'worklet';
    const newObject = {...object};

    for(const id in object){
        if(object[id] === from){
            newObject[id] = to;
        }

        if(object[id] === to){
            newObject[id] = from;
        }
    }
    return newObject;
}





type TaskItemProps = {
    id: string,
    isEditing: boolean,
    moving?: boolean,
    onChangeSubject?:(subject: string)=>void,
    onFinishEditing?: ()=>void,

    isDone: boolean,
    onToggleCheckbox?: ()=> void,
    onPressLabel?: ()=>void,
    onRemove?: ()=>void,
    subject: string,
} & Pick<PanGestureHandlerProps, 'simultaneousHandlers'>




interface MovableTaskItemProps extends TaskItemProps {
    positions: Animated.SharedValue<any>,
    scrollY: any,
    totalTasks: number,
}


const ITEM_HEIGHT = 56;
const AnimatedHStack = Animated.createAnimatedComponent(HStack);

export const MovableTaskItem = ({positions, scrollY,totalTasks, ...props}: MovableTaskItemProps)=>{
    const [moving, setMoving] = useState<boolean>(false);
    const top = useSharedValue(positions.value[props.id] * ITEM_HEIGHT,)

    useAnimatedReaction(
        ()=>positions.value[props.id],
        (currentPosition, previousPosition)=>{
            if(currentPosition !== previousPosition){ 
                if(!moving){
                    // const windowPosition = currentPosition + 254;
                    top.value = withSpring(currentPosition * ITEM_HEIGHT);
                }
            }
    },
    [moving]
    )



    const gestureHanlder = useAnimatedGestureHandler({
        onStart(){
            runOnJS(setMoving)(true);
        },
        onActive(event){

            // where 254 - is masthead
                
            const positionY = event.absoluteY - 254;

            
            top.value = withTiming(positionY - ITEM_HEIGHT, {
                duration:16,
            });

            console.log('pos',totalTasks)

            const newPosition = clamp(
                Math.floor(positionY/ITEM_HEIGHT),
                0,
                totalTasks -1,
            )

            console.log('new position', newPosition)

            if(newPosition !== positions.value[props.id]){
               const res = objectMove(
                    positions.value,
                    positions.value[props.id],
                    newPosition,
                )

            
                positions.value = res;
            }
        },
        onFinish(){
            top.value = positions.value[props.id] * ITEM_HEIGHT
            runOnJS(setMoving)(false);

        },
    })
    const animatedStyle = useAnimatedStyle(()=>({
        position: 'absolute',
        justifyContent:'space-between',
        right:0,
        left:0,
        flexDirection:'row',
        top: top.value,
        zIndex: moving ? 100 : 0,
        shadowColor: 'white',
        shadowOffset:{
            height: 0,
            width: 0,
        },
        shadowOpacity: withSpring(moving ? 0.4 : 0),
        borderRadius:50,
        shadowRadius: 10,
    }),[moving])

    const animatedContainerStyle = useAnimatedStyle(()=>({
        flexBasis: '73%',
        backgroundColor: withSpring(moving ? 'orange': 'transparent',{velocity:100}),

    }))

    return (
        <Animated.View
            style={animatedStyle}
        >
                <View style={{flexBasis:'73%'}}>
                    <TaskItem {...props} moving={moving}/>
                </View>
                <View style={{flexBasis:'20%'}}>
                <PanGestureHandler onGestureEvent={gestureHanlder}>
                    <Animated.View style={{backgroundColor: moving ? 'white' : '#001433', borderRadius:10}}>
                        <Box w="full" alignItems="center" py={2} backgroundColor="red" >
                        <Icon color={moving ? '#001433' : 'white'} as={<Feather name="move"/>} size="sm"/>
                        </Box>
                    </Animated.View>
                </PanGestureHandler>
                </View>
        </Animated.View>
    )
}



const TaskItem = (props:TaskItemProps) =>{
    const { isDone, onToggleCheckbox, subject, onRemove, onPressLabel, simultaneousHandlers, onChangeSubject, onFinishEditing, isEditing, moving} = props;
    const handleChangeSubject = useCallback((e: NativeSyntheticEvent<TextInputChangeEventData>)=>{
        onChangeSubject &&  onChangeSubject(e.nativeEvent.text);
    },[onChangeSubject]);
    
    
    const theme = useTheme();
    const highlightColor = themeTools.getColor(
        theme,
        useColorModeValue('blue.500','blue.400')
    );

    const boxStroke = themeTools.getColor(
        theme,
        useColorModeValue('muted.300','muted.500')
    );

    const checkmarkColor = themeTools.getColor(
        theme,
        useColorModeValue('white','white')
    );

    const activeTextColor = themeTools.getColor(
        theme,
        useColorModeValue('darkText','lightText')
    )

    const doneTextColor = themeTools.getColor(
        theme,
        useColorModeValue('muted.400','muted.600')
    );
    


    const animatedHStackStyle = useAnimatedStyle(()=>({
        backgroundColor: withSpring(moving ? '#4285F4' : '#001433'),
        borderTopRightRadius:15,
        borderBottomRightRadius:15,
    }))


    return (
                <SwipeView simultaneousHandlers={simultaneousHandlers}
                    onSwipeLeft={onRemove}
                    backView={
                        <Box w="full" h="full" bg="red.500" alignItems="flex-end" justifyContent="center" pr={4} style={{
                            borderTopRightRadius:15,
                            borderBottomRightRadius:15,
                        }}>
                            <Icon color="white" as={<Feather name="trash-2"/>} size="sm"/>
                        </Box>
                    }>
                <AnimatedHStack 
                    style={animatedHStackStyle}
                    alignItems="center"
                    w="full" 
                    px={4} 
                    py={2}
                    // bg={useColorModeValue('warmGray.50','primary.900')}
                >
                    <Box width={30} height={30} mr={2}>
                        <Pressable onPress={onToggleCheckbox}>
                            <AnimatedCheckbox 
                                highlightColor={highlightColor}
                                checkmarkColor={checkmarkColor}
                                boxOutlineColor={boxStroke}
                                checked={isDone}
                            />
                        </Pressable>

                    </Box>
                    {isEditing ? (
                        <Input onChange={handleChangeSubject} placeholder="Task" value={subject} variant="unstyled" fontSize={19} px={1} py={0} autoFocus blurOnSubmit onBlur={onFinishEditing} />
                    ) : (
                        <AnimatedTaskLabel
                        onPress={onPressLabel}

                        textColor={activeTextColor}
                        inactiveTextColor={doneTextColor} 
                        strikethrough={isDone}
                    > 
                        {subject}
                    </AnimatedTaskLabel>
                    )}
                </AnimatedHStack>
                </SwipeView>
    )
}


export default MovableTaskItem
// export default TaskItem;
import React, {useCallback, useRef} from 'react'
import {AnimatePresence, View} from 'moti';
import { PanGestureHandlerProps, ScrollView } from 'react-native-gesture-handler';
import TaskItem from './task-item';
import { makeStyledComponent } from '../utils/styled';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';

const StyledView = makeStyledComponent(View);
const StyledScrollView = makeStyledComponent(Animated.ScrollView);

export interface TaskItemData {
    id: string,
    subject:string,
    done: boolean,

}

interface TaskListProps {
    data: Array<TaskItemData>,
    positions: Animated.SharedValue<any>,
    editingItemId: string | null,
    onToggleItem: (item: TaskItemData)=>void,
    onChangeSubject: (item: TaskItemData, newSubject: string)=> void,
    onFinishEditing: (item: TaskItemData)=> void,
    onPressLabel: (item: TaskItemData)=> void,
    onRemoveItem: (item: TaskItemData)=> void,
}

interface TaskItemProps extends Pick<PanGestureHandlerProps, 'simultaneousHandlers'>{
    data: TaskItemData,
    scrollY: any,
    totalTasks: number,
    positions: Animated.SharedValue<any>,
    isEditing: boolean,
    onToggleItem: (item: TaskItemData)=> void,
    onChangeSubject: (item: TaskItemData, newSubject: string)=> void,
    onFinishEditing: (item: TaskItemData)=> void,
    onPressLabel: (item: TaskItemData)=> void,
    onRemove: (item: TaskItemData)=> void,
}

export const AnimatedTaskItem = (props:TaskItemProps)=> {
    const {
        simultaneousHandlers,
        data,
        isEditing,
        onToggleItem,
        onChangeSubject,
        onFinishEditing,
        onPressLabel,
        onRemove,
        positions,
        scrollY,
        totalTasks,
    } = props;

    const handleToggleCheckbox = useCallback(()=>{
        onToggleItem(data)
    },[data, onToggleItem])

    const handleChangeSubject = useCallback(subject=>{
        onChangeSubject(data,subject);
    },[data, onChangeSubject])

    const handleFinishEditing = useCallback(()=>{
        onFinishEditing(data)  
    },[data,onFinishEditing])

    const handlePressLable = useCallback(()=>{
        onPressLabel(data);
    },[data,onPressLabel])

    const handleRemove = useCallback(()=>{
        onRemove(data);
    },[data,onRemove])

    return (
        <StyledView w="full" from={{
            opacity: 0,
            scale: 0.5,
            marginBottom: -46,

        }}
        animate={{
            opacity: 1,
            scale: 1,
            marginBottom: 0,
        }}

        exit={{
            opacity: 0,
            scale: 0.45,
            marginBottom: -46,
        }}
        >
            <TaskItem
                totalTasks={totalTasks}
                positions={positions}
                scrollY={scrollY}
                id={data.id}
                simultaneousHandlers={simultaneousHandlers}
                subject={data.subject}
                isDone={data.done}
                isEditing={isEditing}
                onToggleCheckbox={handleToggleCheckbox}
                onChangeSubject={handleChangeSubject}
                onFinishEditing={handleFinishEditing}
                onPressLabel={handlePressLable}
                onRemove={handleRemove}
                
            />
        </StyledView>
    )

}

export default function TaskList(props: TaskListProps){
    const {
        data,
        editingItemId,
        onToggleItem,
        onChangeSubject,
        onFinishEditing,
        onPressLabel,
        onRemoveItem,
        positions
    } = props; 
    const refScrollView = useRef(null);
    const scrollY = useSharedValue(0);
    const handleScroll = useAnimatedScrollHandler(event=>{
        scrollY.value = event.contentOffset.y;
    })



    return (
        <StyledScrollView 
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ref={refScrollView} w="full">
            <AnimatePresence>
                {data.map(item=>(
                    <AnimatedTaskItem key={item.id} data={item} simultaneousHandlers={refScrollView}
                        isEditing={item.id === editingItemId}
                        totalTasks={data.length}
                        positions={positions}
                        scrollY={scrollY}
                        onToggleItem={onToggleItem}
                        onChangeSubject={onChangeSubject}
                        onFinishEditing={onFinishEditing}
                        onPressLabel={onPressLabel}
                        onRemove={onRemoveItem}

                    />
                ))}
            </AnimatePresence>
        </StyledScrollView>
    )
}
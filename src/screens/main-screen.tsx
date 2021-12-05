import { AntDesign } from '@expo/vector-icons';
import { Center, Fab, Icon, themeTools, useColorModeValue, useTheme, VStack } from 'native-base';
import React, { useCallback, useRef, useState, useEffect } from 'react';
import shortid from 'shortid';
import TaskList, { TaskItemData } from '../components/task-list';
import AnimatedColorBox from '../components/animated-color-box';
import Masthead from '../components/masthead';
import NavBar from '../components/navbar';
import { useSharedValue } from 'react-native-reanimated';

const initialData = [
  {
    id:shortid.generate(),
    subject: 'Рукоблуд',
    done: false,

  },
  {
    id: shortid.generate(),
    subject: 'Ссанина',
    done: false,
  },
  {
    id:shortid.generate(),
    subject: 'Очко',
    done: false,

  },
  {
    id: shortid.generate(),
    subject: 'Блядун',
    done: false,
  },
  {
    id:shortid.generate(),
    subject: 'Вагина',
    done: false,

  },
  {
    id: shortid.generate(),
    subject: 'Сука',
    done: false,
  },
  {
    id:shortid.generate(),
    subject: 'Ебланище',
    done: false,

  },
  {
    id: shortid.generate(),
    subject: 'Prepare for interview',
    done: false,
  }
]


function listToObject(list: Array<TaskItemData>){
  const values = Object.values(list);
  const object: any = {};

  for(let i = 0; i<values.length; i++){
    object[values[i].id] = i;
  }
  return object
}


export default function MainScreen(){
    const [data, setData] = useState(initialData);
    const positions = useSharedValue(listToObject(initialData));
    const [editingItemId, setEditingItemId] = useState<string | null> (null);

  useEffect(()=>{
    setTimeout(()=>{
      positions.value = listToObject(data);
    },300)
  },[data]);


    const handleToggleTaskItem = useCallback(item=>{
        setData(prevData=>{
          const newData = [...prevData];
          const idx = prevData.indexOf(item)
          newData[idx] = {
            ...item,
            done: !item.done,
          }

          return newData;
        });
    },[]);

    const handleChangeTaskItemSubject = useCallback((item, newSubject)=>{
      setData(prevData=>{
        const newData = [...prevData];
        const idx = prevData.indexOf(item);
        newData[idx] = {
          ...item,
          subject:newSubject,
        }

        return newData;
      })
    },[])

    const handleFinishEditingTaskItem = useCallback(_item=>{
        setEditingItemId(null)

    },[]);

    const handlePressTaskItemLabel = useCallback(item=>{
      setEditingItemId(item.id);
    },[])

    const handleRemoveItem = useCallback(item=>{
        setData(prevData=>{
          const newData = prevData.filter(i=> i.id !== item.id);
          return newData;
        })
    },[])



    const theme = useTheme()
    const highlightColor = themeTools.getColor(
      theme,
      useColorModeValue('blue.500', 'blue.400')
    )
    const boxStroke = themeTools.getColor(
      theme,
      useColorModeValue('muted.300', 'muted.500')
    )
    const checkmarkColor = themeTools.getColor(
      theme,
      useColorModeValue('white', 'white')
    )
    const activeTextColor = themeTools.getColor(
      theme,
      useColorModeValue('darkText', 'lightText')
    ) 
    const doneTextColor = themeTools.getColor(
      theme,
      useColorModeValue('muted.400', 'muted.600')
    )
    return (
        <AnimatedColorBox bg={useColorModeValue('warmGray.50','primary.900')} flex={1}
          w="full"
        >
          <Masthead title="Test" image={require('../assets/giphy-1.gif')}>
            <NavBar/>
          </Masthead>
            <VStack  flex={1} space={1} mt="-20px" borderTopLeftRadius="20px" borderTopRightRadius="20px" pt="20px" bg={useColorModeValue('warmGray.50','primary.900')}>
            <TaskList
              positions={positions}
              data={data}
              onToggleItem={handleToggleTaskItem}
              onChangeSubject={handleChangeTaskItemSubject}
              onFinishEditing={handleFinishEditingTaskItem}
              onPressLabel={handlePressTaskItemLabel}
              onRemoveItem={handleRemoveItem}
              editingItemId={editingItemId}
      
            />
            </VStack>
            <Fab
                position="absolute"
                renderInPortal={false}
                size="sm"
                icon={<Icon color="white" as={<AntDesign name="plus"/>}/>}
                colorScheme={useColorModeValue('blue', 'darkBlue')}
                bg={useColorModeValue('blue.500','blue.400')}
                onPress={()=>{
                  const id = shortid.generate()
                  const newData = [{
                    id,
                    subject: '',
                    done:false,
                  },...data];
                  setData(newData);
                  setEditingItemId(id);
                }}
            /> 
        </AnimatedColorBox>
    )
}
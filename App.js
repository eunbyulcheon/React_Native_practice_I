import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	TextInput,
	ScrollView,
	Alert,
	Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { Fontisto, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from './colors';

const TODO_KEY = '@toDos';
const TAB_KEY = '@tab';

export default function App() {
	const [working, setWorking] = useState(true);
	const [text, setText] = useState('');
	const [toDos, setToDos] = useState({});
	const [editedText, setEditedText] = useState('');

	useEffect(() => {
		loadToDos();
		loadTab();
	}, []);

	useEffect(() => {
		saveTab();
	}, [working]);

	const travel = () => setWorking(false);
	const work = () => setWorking(true);

	const onChangeText = (payload) => setText(payload);
	const onTextEdit = (payload) => setEditedText(payload);

	const saveToDos = async (toSave) => {
		try {
			await AsyncStorage.setItem(TODO_KEY, JSON.stringify(toSave));
		} catch (error) {
			console.log(error);
		}
	};

	const loadToDos = async () => {
		try {
			const s = await AsyncStorage.getItem(TODO_KEY);
			if (s) {
				setToDos(JSON.parse(s));
			}
		} catch (error) {
			console.log(error);
		}
	};

	const saveTab = async () => {
		try {
			await AsyncStorage.setItem(TAB_KEY, JSON.stringify(working));
		} catch (error) {
			console.log(error);
			return;
		}
	};

	const loadTab = async () => {
		try {
			const t = await AsyncStorage.getItem(TAB_KEY);
			setWorking(JSON.parse(t));
		} catch (error) {
			console.log(error);
			return;
		}
	};

	const addToDo = async () => {
		if (text === '') return;
		const newToDos = {
			...toDos,
			[Date.now()]: { text, working, isChecked: false, editing: false },
		};
		setToDos(newToDos);
		await saveToDos(newToDos);
		setText('');
	};

	const deleteToDo = (key) => {
		if (Platform.OS === 'web') {
			const ok = confirm('Do you want to delete this To Do?');
			if (ok) {
				const newToDos = { ...toDos };
				delete newToDos[key];
				setToDos(newToDos);
				saveToDos(newToDos);
			}
		} else {
			Alert.alert('Delete To Do', 'Are you sure?', [
				{ text: 'Cancel' },
				{
					text: "I'm Sure",
					style: 'destructive',
					onPress: () => {
						const newToDos = { ...toDos };
						delete newToDos[key];
						setToDos(newToDos);
						saveToDos(newToDos);
					},
				},
			]);
		}
	};

	const checkToDo = (key) => {
		const newToDos = { ...toDos };
		newToDos[key].isChecked = newToDos[key].isChecked ? false : true;
		setToDos(newToDos);
		saveToDos(newToDos);
	};

	const editToDo = (key) => {
		toDos[key] = { ...toDos[key], editing: true };
		const newToDos = { ...toDos };
		setToDos(newToDos);
		saveToDos(newToDos);
	};

	const submitEdit = async (key) => {
		if (!toDos[key].text === '') return;
		toDos[key] = { ...toDos[key], text: editedText, editing: false };
		const newToDos = { ...toDos };
		setToDos(newToDos);
		saveToDos(newToDos);
		setEditedText('');
	};

	const cancelEdit = (key) => {
		const newToDos = { ...toDos };
		newToDos[key].editing = false;
		setToDos(newToDos);
		saveToDos(newToDos);
	};

	return (
		<View style={styles.container}>
			<StatusBar style="light" />
			<View style={styles.header}>
				<TouchableOpacity onPress={work}>
					<Text
						style={{ ...styles.btnText, color: working ? 'white' : theme.grey }}
					>
						Work
					</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={travel}>
					<Text
						style={{
							...styles.btnText,
							color: !working ? 'white' : theme.grey,
						}}
					>
						Travel
					</Text>
				</TouchableOpacity>
			</View>

			<TextInput
				onSubmitEditing={addToDo}
				onChangeText={onChangeText}
				value={text}
				returnKeyType="done"
				placeholder={working ? 'Add a To Do' : 'Where do you want to go?'}
				style={styles.input}
			/>

			<ScrollView>
				{Object.keys(toDos).map((key) =>
					toDos[key].working === working ? (
						<View style={styles.toDo} key={key}>
							{toDos[key].editing ? (
								<TextInput
									onSubmitEditing={() => submitEdit(key)}
									onChangeText={(text) => onTextEdit(text)}
									value={editedText}
									style={styles.toDoText}
									autoFocus={true}
									returnKeyType="done"
									selectionColor="red"
								/>
							) : (
								<BouncyCheckbox
									textStyle={{
										color: toDos[key].isChecked === false ? '#fff' : '#95a5a6',
									}}
									isChecked={toDos[key].isChecked}
									text={toDos[key].text}
									onPress={() => checkToDo(key)}
									fillColor="red"
									innerIconStyle={{
										borderColor:
											toDos[key].isChecked === false ? 'white' : 'red',
									}}
								/>
							)}

							<View style={styles.iconBtn}>
								{toDos[key].editing ? (
									<TouchableOpacity onPress={() => cancelEdit(key)}>
										<MaterialCommunityIcons
											name="cancel"
											size={20}
											color="#fff"
										/>
									</TouchableOpacity>
								) : (
									<TouchableOpacity onPress={() => editToDo(key)}>
										<Feather name="edit-3" size={20} color="#fff" />
									</TouchableOpacity>
								)}

								<TouchableOpacity
									style={{ marginLeft: 15 }}
									onPress={() => deleteToDo(key)}
								>
									<Fontisto name="trash" size={20} color="red" />
								</TouchableOpacity>
							</View>
						</View>
					) : null
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 20,
		backgroundColor: theme.bg,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 100,
	},
	btnText: {
		color: '#fff',
		fontSize: 38,
		fontWeight: '600',
	},
	input: {
		backgroundColor: '#fff',
		marginVertical: 20,
		paddingVertical: 15,
		paddingHorizontal: 20,
		borderRadius: 20,
		fontSize: 16,
	},
	toDo: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 10,
		paddingVertical: 20,
		paddingHorizontal: 20,
		borderRadius: 20,
		backgroundColor: theme.grey,
	},
	toDoText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '500',
	},
	iconBtn: {
		flexDirection: 'row',
	},
});

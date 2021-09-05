import React, { Component } from "react";
import Web3 from "web3";
import TodoList from "../abis/TodoList.json";
import "./App.css";

class App extends Component {
  async componentDidMount() {
    this.loadWeb3();
    this.loadBlockChainData();
  }

  async loadBlockChainData() {
    const web3 = window.web3;

    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    // Load TodoList Contract
    const networkId = await web3.eth.net.getId();
    const todolistdata = TodoList.networks[networkId];
    if (todolistdata) {
      const todoList = new web3.eth.Contract(
        TodoList.abi,
        todolistdata.address
      );
      console.log(todoList);
      this.setState({ todoList: todoList });
      this.renderTasks();
    } else {
      window.alert("ethSwap contract not deployed to detected network");
    }
    this.setState({ loading: false });
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non Ethereum browser detected. You should consider trying metamask"
      );
    }
  }

  toggleCompleted = async (e) => {
    this.setState({ loading: true });
    console.log(e.target.value);
    await this.state.todoList.methods
      .toggleCompleted(e.target.value)
      .send({ from: this.state.account })
      .on("confirmation", async () => {
        window.location.reload();
      });
  };

  addTask = async (e) => {
    e.preventDefault();
    this.setState({ loading: true });
    console.log(this.state.todoList.address);
    console.log(this.state.account);
    await this.state.todoList.methods
      .createTask(this.state.input)
      .send({ from: this.state.account })
      .on("confirmation", async () => {
        window.location.reload();
      });

    console.log(this.state.tasks);
  };

  renderTasks = async () => {
    // console.log(await this.state.todoList.methods.createTask("new").call());
    // Load the total task count from the blockchain
    let taskCount = await this.state.todoList.methods.taskCount().call();
    taskCount = taskCount;
    console.log(taskCount);
    // Render Out each task with a new task template
    for (let i = 1; i <= taskCount; i++) {
      const task = await this.state.todoList.methods.tasks(i).call();
      const taskId = task[0].toNumber();
      const taskContent = task[1];
      const taskCompleted = task[2];
      const a = {
        taskId,
        taskContent,
        taskCompleted,
      };
      this.setState({ tasks: [...this.state.tasks, a] });
    }
    console.log(this.state.tasks);

    // Show the task
  };

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      loading: true,
      tasks: [],
      input: "",
    };
  }

  render() {
    let content;
    if (this.state.loading) {
      content = <p>loading...</p>;
    } else {
      content = (
        <>
          <div className="input">
            <form action="" onSubmit={this.addTask}>
              <input
                value={this.state.input}
                onChange={(e) => this.setState({ input: e.target.value })}
                type="text"
                name=""
                id=""
              />
              <button className="none">Submit</button>
            </form>
          </div>
          <>
            {this.state.tasks.map((task, key) => {
              return (
                <>
                  <div className="todo">
                    <input
                      type="checkbox"
                      checked={task.taskCompleted}
                      onChange={this.toggleCompleted}
                      value={key + 1}
                      name={key + 1}
                      id=""
                    />
                    <h3 className={task.taskCompleted ? "checked space" : "space"} key={key}>
                      {task.taskContent}
                    </h3>
                  </div>
                </>
              );
            })}
          </>
        </>
      );
    }

    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            TODO LIST
          </a>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">{content}</div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

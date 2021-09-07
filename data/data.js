export function getDefaultPosts() {
  return [
    {
      key: '1',
      name: 'ResurgentFox',
      date: '14:33',
      text: 'Nice to meet you guys!',
    },
    {
      key: '2',
      name: 'Winston_Wolf',
      date: '12:15',
      text: 'So you guys are fans of Tarantino`s movies?',
    },
    {
      key: '3',
      name: 'Butch',
      date: '13:33',
      text: 'Here`s a really nice place!',
    },
    {
      key: '4',
      name: 'Mr.Pink',
      date: '11:33',
      text: 'Add me guys, I`m new here',
    },
    {
      key: '5',
      name: 'Vincent',
      date: '11:15',
      text: 'How can I upoad my photos?',
    },
  ]
}

export class Posts {
  constructor(){
    this.posts = getDefaultPosts()
  }
    getPosts() {
      return this.posts
    }
    addPost(post) {
      this.posts.push(post)
    }
  }
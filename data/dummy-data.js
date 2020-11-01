/*export const feedData = [
    {
        id: '1',
        imageUrl: ['https://www.searchenginewatch.com/wp-content/uploads/2018/10/ThinkstockPhotos-503426092.jpg',
            'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60',
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60'],
        description: 'Hey see my travel photos. Isnt it cool? Comment me to let us know ',
        username: 'r.das',
        likedPeople: ['priy.chav', 'sus.nan', 'labanya', 'r.sonkar'],
        comments: [
            {
                id: '1',
                username: 'r.das',
                comments: 'Seems like a nice picture',
                isLiked: false
            },
            { 
                id: '2',
                username: 'priy.chav',
                comments: 'Seems like a nice picture',
                isLiked: false
            },
            {
                id: '3',
                username: 'labanya',
                comments: 'Seems like a nice picture',
                isLiked: false
            }
        ],
        savedBy: ['priy.chav']
    },
    {
        id: '2',
        imageUrl: ['https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60'],
        username: 'priy.chav',
        likedPeople: ['r.das', 'priy.chav', 'sus.nan', 'labanya'],
        comments: [],
        savedBy: ['r.das', 'priy.chav']
    },
    {
        id: '3',
        imageUrl: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60'],
        username: 'sus.nan',
        likedPeople: ['r.das', 'priy.chav', 'sus.nan', 'labanya'],
        comments: [],
        savedBy: ['r.das', 'priy.chav']
    },
    {
        id: '4',
        imageUrl: ['https://images.unsplash.com/photo-1581456495146-65a71b2c8e52?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60'],
        username: 'sush.Nan',
        likedPeople: ['r.das', 'priy.chav', 'sus.nan', 'labanya'],
        comments: [],
        savedBy: ['r.das', 'priy.chav']
    },
    {
        id: 5,
        imageUrl: ['https://image.shutterstock.com/image-photo/howrah-bridge-historic-cantilever-on-260nw-677901256.jpg'],
        username: 'rosh.das',
        likedPeople: ['r.das', 'priy.chav', 'sus.nan', 'labanya'],
        comments: [],
        savedBy: ['r.das', 'priy.chav']
    },
    {
        id: '6',
        imageUrl: ['https://i.pinimg.com/originals/ca/76/0b/ca760b70976b52578da88e06973af542.jpg'],
        username: 'r.sonkar',
        likedPeople: ['r.das', 'priy.chav', 'sus.nan', 'labanya'],
        comments: [],
        savedBy: ['r.das', 'priy.chav']
    },
    {
        id: '7',
        imageUrl: ['https://image.shutterstock.com/image-photo/bright-spring-view-cameo-island-260nw-1048185397.jpg'],
        username: 'labanya',
        likedPeople: ['r.das', 'priy.chav', 'sus.nan', 'labanya'],
        comments: [],
        savedBy: ['r.das', 'priy.chav']
    },
    {
        id: '8',
        imageUrl: ['https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&w=1000&q=80'],
        username: 'r.das',
        likedPeople: ['r.das', 'priy.chav', 'sus.nan', 'labanya'],
        comments: [],
        savedBy: ['r.das', 'priy.chav']
    },
    {
        id: '9',
        imageUrl: ['https://media.istockphoto.com/photos/child-hands-formig-heart-shape-picture-id951945718?k=6&m=951945718&s=612x612&w=0&h=ih-N7RytxrTfhDyvyTQCA5q5xKoJToKSYgdsJ_mHrv0='],
        username: 'r.das',
        likedPeople: ['r.das', 'priy.chav', 'sus.nan', 'labanya'],
        comments: [],
        savedBy: ['r.das', 'priy.chav']
    },
    {
        id: '10',
        imageUrl: ['https://media.gettyimages.com/photos/woman-lifts-her-arms-in-victory-mount-everest-national-park-picture-id507910624?s=612x612'],
        username: 'r.das',
        likedPeople: ['r.das', 'priy.chav', 'sus.nan', 'labanya'],
        comments: [],
        savedBy: ['r.das', 'priy.chav']
    },
    {
        id: '11',
        imageUrl: ['https://i.pinimg.com/originals/af/8d/63/af8d63a477078732b79ff9d9fc60873f.jpg'],
        username: 'r.das',
        likedPeople: ['r.das', 'priy.chav', 'sus.nan', 'labanya'],
        comments: [],
        savedBy: ['r.das', 'priy.chav']
    },
    {
        id: '12',
        imageUrl: ['https://images.unsplash.com/photo-1535332371349-a5d229f49cb5?ixlib=rb-1.2.1&w=1000&q=80'],
        username: 'r.das',
        likedPeople: ['r.das', 'priy.chav', 'sus.nan', 'labanya'],
        comments: [],
        savedBy: ['r.das', 'priy.chav']
    },
    {
        id: '13',
        imageUrl: ['https://images.unsplash.com/photo-1535332371349-a5d229f49cb5?ixlib=rb-1.2.1&w=1000&q=80'],
        username: 'r.das',
        likedPeople: ['r.das', 'priy.chav', 'sus.nan', 'labanya'],
        comments: [],
        savedBy: ['r.das', 'priy.chav']
    },
    {
        id: '14',
        imageUrl: ['https://images.unsplash.com/photo-1535332371349-a5d229f49cb5?ixlib=rb-1.2.1&w=1000&q=80'],
        username: 'r.das',
        likedPeople: ['r.das', 'priy.chav', 'sus.nan', 'labanya'],
        comments: [],
        savedBy: ['r.das', 'priy.chav']
    },
    {
        id: '15',
        imageUrl: ['https://images.unsplash.com/photo-1535332371349-a5d229f49cb5?ixlib=rb-1.2.1&w=1000&q=80'],
        username: 'r.das',
        likedPeople: ['r.das', 'priy.chav', 'sus.nan', 'labanya'],
        comments: [],
        savedBy: ['r.das', 'priy.chav']
    },
    {
        id: '16',
        imageUrl: ['https://images.unsplash.com/photo-1535332371349-a5d229f49cb5?ixlib=rb-1.2.1&w=1000&q=80'],
        username: 'r.das',
        likedPeople: ['r.das', 'priy.chav', 'sus.nan', 'labanya'],
        comments: [],
        savedBy: ['r.das', 'priy.chav']
    },
    {
        id: '17',
        imageUrl: ['https://images.unsplash.com/photo-1535332371349-a5d229f49cb5?ixlib=rb-1.2.1&w=1000&q=80'],
        username: 'r.das',
        likedPeople: ['r.das', 'priy.chav', 'sus.nan', 'labanya'],
        comments: [],
        savedBy: ['r.das', 'priy.chav']
    },
    {
        id: '18',
        imageUrl: ['https://images.unsplash.com/photo-1535332371349-a5d229f49cb5?ixlib=rb-1.2.1&w=1000&q=80'],
        username: 'r.das',
        likedPeople: ['r.das', 'priy.chav', 'sus.nan', 'labanya'],
        comments: [],
        savedBy: ['r.das', 'priy.chav']
    },
    {
        id: '19',
        imageUrl: ['https://images.unsplash.com/photo-1535332371349-a5d229f49cb5?ixlib=rb-1.2.1&w=1000&q=80'],
        username: 'r.das',
        likedPeople: ['r.das', 'priy.chav', 'sus.nan', 'labanya'],
        comments: [],
        savedBy: ['r.das', 'priy.chav']
    },
    {
        id: '20',
        imageUrl: ['https://images.unsplash.com/photo-1535332371349-a5d229f49cb5?ixlib=rb-1.2.1&w=1000&q=80'],
        username: 'r.das',
        likedPeople: ['r.das', 'priy.chav', 'sus.nan', 'labanya'],
        comments: [],
        savedBy: ['r.das', 'priy.chav']
    },
    {
        id: '21',
        imageUrl: ['https://homepages.cae.wisc.edu/~ece533/images/monarch.png'],
        videoUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
        username: 'priy.chav',
        likedPeople: ['r.das', 'priy.chav', 'sus.nan', 'labanya'],
        comments: [],
        savedBy: ['priy.chav']
    },
    {
        id: '22',
        imageUrl: ['https://docs.imagga.com/static/images/docs/sample/japan-605234_1280.jpg'],
        username: 'priy.chav',
        likedPeople: ['r.das', 'priy.chav', 'sus.nan', 'labanya'],
        comments: [],
        savedBy: ['priy.chav']
    },
    {
        id: '23',
        imageUrl: ['https://i.pinimg.com/originals/9f/5b/86/9f5b861cab2951d4de0640329bb8355f.jpg'],
        username: 'priy.chav',
        likedPeople: ['r.das', 'priy.chav', 'sus.nan', 'labanya'],
        comments: [],
        savedBy: ['priy.chav']
    },
    {
        id: '24',
        imageUrl: ['https://cdn.kyushuandtokyo.org/front_assets/images_other/spot/small/asokako1.jpg'],
        username: 'priy.chav',
        likedPeople: ['r.das', 'priy.chav', 'sus.nan', 'labanya'],
        comments: [],
        savedBy: ['priy.chav']
    }
]*/

/* export const userData = [
    {
        username: 'r.das',
        fullName: 'Raunak Das',
        profileImage: 'https://images.unsplash.com/photo-1545996124-0501ebae84d0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80',
        posts: 14,
        following: ['priy.chav', 'sush.Nan'],
        followers: ['priy.chav', 'sush.Nan', 'sus.nan', 'r.sonkar', 'labanya'],
        status: 'Hey I am in Instagram. Lets connect '
    },
    {
        username: 'priy.chav',
        fullName: 'Priyanka Chavan',
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80',
        posts: 1,
        following: ['r.das', 'sush.Nan'],
        followers: ['rosh.das', 'r.das'],
        status: 'Hey I am in Instagram. Lets connect '
    },
    {
        username: 'sush.Nan',
        fullName: 'Sushanta Nandy',
        profileImage: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Outdoors-man-portrait_%28cropped%29.jpg',
        posts: 1,
        following: ['sus.nan', 'rosh.das', 'r.das', 'r.sonkar'],
        followers: ['sus.nan', 'rosh.das', 'priy.chav'],
        status: 'Hey I am in Instagram. Lets connect '
    },
    {
        username: 'sus.nan',
        fullName: 'Susmita Nandy',
        profileImage: 'https://images.unsplash.com/photo-1578489758854-f134a358f08b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80',
        posts: 1,
        following: ['r.das', 'r.sonkar', 'rosh.das'],
        followers: ['rosh.das', 'labanya', 'sush.Nan', 'r.sonkar'],
        status: 'Hey I am in Instagram. Lets connect '
    },
    {
        username: 'rosh.das',
        fullName: 'Roshnee Das',
        profileImage: 'https://cdn.pixabay.com/photo/2017/08/07/14/15/portrait-2604283__340.jpg',
        posts: 1,
        following: ['sus.nan', 'sush.Nan', 'r.sonkar', 'priy.chav'],
        followers: ['labanya', 'sus.nan', 'sush.Nan', 'r.sonkar'],
        status: 'Hey I am in Instagram. Lets connect '
    },
    {
        username: 'r.sonkar',
        fullName: 'Raja Sonkar',
        profileImage: 'https://www.runscope.com/static/img/public/customer-portrait-human-api.png',
        posts: 1,
        following: ['labanya', 'r.das', 'sus.nan', 'rosh.das'],
        followers: ['sus.nan', 'sush.Nan'],
        status: 'Hey I am in Instagram. Lets connect '
    },
    {
        username: 'labanya',
        fullName: 'Labanya Dutta Ray',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80',
        posts: 1,
        following: ['rosh.das', 'r.das', 'sus.nan'],
        followers: ['r.sonkar'],
        status: 'Hey I am in Instagram. Lets connect '
    }
]  */